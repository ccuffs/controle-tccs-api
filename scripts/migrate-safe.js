#!/usr/bin/env node

/**
 * Script para rodar migrations de forma segura, ignorando erros de objetos já existentes
 * (tabelas, constraints, índices, etc)
 */

const path = require('path');
const fs = require('fs');
const Sequelize = require('sequelize');

// Carregar configuração do banco
const configPath = path.join(__dirname, '../src/config/database.js');
const config = require(configPath);
const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

// Criar conexão com o banco
const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: console.log,
  }
);

// Criar tabela SequelizeMeta se não existir
async function ensureMetaTable() {
  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS "SequelizeMeta" (
      name VARCHAR(255) NOT NULL PRIMARY KEY
    );
  `);
}

// Verificar se migration já foi executada
async function isMigrationExecuted(migrationName) {
  const [results] = await sequelize.query(
    'SELECT name FROM "SequelizeMeta" WHERE name = ?',
    { replacements: [migrationName] }
  );
  return results.length > 0;
}

// Marcar migration como executada
async function markMigrationAsExecuted(migrationName) {
  await sequelize.query(
    'INSERT INTO "SequelizeMeta" (name) VALUES (?) ON CONFLICT (name) DO NOTHING',
    { replacements: [migrationName] }
  );
}

// Códigos de erro do PostgreSQL que devemos ignorar
const IGNORABLE_ERROR_CODES = {
  '42P07': 'Tabela já existe',
  '42710': 'Objeto já existe (constraint, índice, etc)',
  '42P16': 'Índice já existe',
  '42830': 'Foreign key já existe',
};

// Verificar se o erro pode ser ignorado
function isIgnorableError(error) {
  // Verificar código de erro do PostgreSQL
  if (error.parent && error.parent.code && IGNORABLE_ERROR_CODES[error.parent.code]) {
    return IGNORABLE_ERROR_CODES[error.parent.code];
  }

  // Verificar mensagens de erro comuns
  const errorMessage = error.message.toLowerCase();
  if (
    errorMessage.includes('already exists') ||
    errorMessage.includes('já existe') ||
    errorMessage.includes('duplicate key')
  ) {
    return 'Objeto já existe';
  }

  return null;
}

// Executar uma migration
async function runMigration(migrationFile) {
  const migrationName = path.basename(migrationFile);

  console.log(`\n${'='.repeat(60)}`);
  console.log(`Migration: ${migrationName}`);
  console.log('='.repeat(60));

  // Verificar se já foi executada
  if (await isMigrationExecuted(migrationName)) {
    console.log('Já executada anteriormente (registrada no banco)');
    return { success: true, skipped: true };
  }

  try {
    // Carregar o arquivo de migration
    const migration = require(migrationFile);

    // Criar queryInterface
    const queryInterface = sequelize.getQueryInterface();

    // Executar a migration
    console.log('Executando...');
    await migration.up(queryInterface, Sequelize);

    // Marcar como executada
    await markMigrationAsExecuted(migrationName);

    console.log('Executada com sucesso');
    return { success: true, skipped: false };

  } catch (error) {
    const ignorableReason = isIgnorableError(error);

    if (ignorableReason) {
      console.log(`Aviso: ${ignorableReason}`);
      console.log(`    Detalhes: ${error.message}`);

      // Marcar como executada mesmo assim
      await markMigrationAsExecuted(migrationName);
      console.log('Marcada como executada (objetos já existem)');

      return { success: true, skipped: false, warning: true };
    } else {
      console.error('Erro não ignorável:');
      console.error(error.message);
      if (error.parent) {
        console.error('Código do erro:', error.parent.code);
      }
      return { success: false, error };
    }
  }
}

// Função principal
async function main() {
  console.log('Iniciando migrations seguras...\n');

  try {
    // Testar conexão
    await sequelize.authenticate();
    console.log('Conexão com banco de dados estabelecida');

    // Garantir que a tabela SequelizeMeta existe
    await ensureMetaTable();
    console.log('Tabela SequelizeMeta verificada\n');

    // Obter lista de migrations
    const migrationsDir = path.join(__dirname, '../src/migrations');
    const files = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.js') && !file.includes('README'))
      .sort(); // Ordem alfabética garante ordem cronológica pelos timestamps

    console.log(`Encontradas ${files.length} migrations\n`);

    // Executar cada migration
    const results = {
      total: files.length,
      success: 0,
      skipped: 0,
      warnings: 0,
      failed: 0,
    };

    for (const file of files) {
      const filePath = path.join(migrationsDir, file);
      const result = await runMigration(filePath);

      if (result.success) {
        results.success++;
        if (result.skipped) results.skipped++;
        if (result.warning) results.warnings++;
      } else {
        results.failed++;
        // Decidir se deve continuar ou parar
        console.log('\nAviso: Erro crítico encontrado. Deseja continuar? (Parando por segurança)');
        break;
      }
    }

    // Resumo final
    console.log('\n' + '='.repeat(60));
    console.log('RESUMO DA EXECUÇÃO');
    console.log('='.repeat(60));
    console.log(`Total de migrations: ${results.total}`);
    console.log(`Executadas com sucesso: ${results.success}`);
    console.log(`Já existiam (puladas): ${results.skipped}`);
    console.log(`Com avisos (objetos já existiam): ${results.warnings}`);
    console.log(`Falharam: ${results.failed}`);
    console.log('='.repeat(60));

    if (results.failed > 0) {
      process.exit(1);
    }

  } catch (error) {
    console.error('\nErro fatal:', error.message);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Executar
main();

