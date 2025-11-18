#!/usr/bin/env node

/**
 * Script para buscar dicentes no LDAP pelo campo cn (nome),
 * criar usuários, atualizar dicentes e criar associações
 */

require("dotenv").config();
const path = require("path");
const Sequelize = require("sequelize");
const ldap = require("ldapjs");

// Carregar configuração do banco
const configPath = path.join(__dirname, "../src/config/database.js");
const config = require(configPath);
const env = process.env.NODE_ENV || "development";
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
		logging: false,
	},
);

// Configuração do LDAP
const ldapConfig = {
	url: process.env.LDAP_URL || "ldap://localhost:389",
	bindDN: process.env.LDAP_BIND_DN || "",
	bindCredentials: process.env.LDAP_BIND_CREDENTIALS || "",
	searchBase: process.env.LDAP_SEARCH_BASE || "dc=example,dc=com",
};

/**
 * Escapa caracteres especiais para filtros LDAP
 * @param {string} str - String para escapar
 * @returns {string} String escapada
 */
function escapeLdapFilter(str) {
	if (!str) return "";
	return str
		.replace(/\\/g, "\\5c")
		.replace(/\(/g, "\\28")
		.replace(/\)/g, "\\29")
		.replace(/\*/g, "\\2a")
		.replace(/\//g, "\\2f")
		.replace(/\0/g, "\\00");
}

/**
 * Busca um usuário no LDAP pelo campo cn (Common Name)
 * @param {string} cn - Nome completo (Common Name) para buscar
 * @returns {Promise<Object|null>} Objeto com uid, mail e uffsEmailAlternativo ou null
 */
async function buscarUidPorCn(cn) {
	return new Promise((resolve, reject) => {
		const client = ldap.createClient({
			url: ldapConfig.url,
		});

		// Bind (autenticação) no LDAP
		client.bind(ldapConfig.bindDN, ldapConfig.bindCredentials, (err) => {
			if (err) {
				client.unbind();
				return reject(new Error(`Erro ao conectar no LDAP: ${err.message}`));
			}

			// Escapar o nome para o filtro LDAP
			const cnEscaped = escapeLdapFilter(cn);

			// Buscar pelo campo cn
			const searchOptions = {
				filter: `(cn=${cnEscaped})`,
				scope: "sub",
				attributes: ["uid", "cn", "mail", "uffsEmailAlternativo"],
			};

			client.search(ldapConfig.searchBase, searchOptions, (err, res) => {
				if (err) {
					client.unbind();
					return reject(new Error(`Erro na busca LDAP: ${err.message}`));
				}

				let found = false;

				res.on("searchEntry", (entry) => {
					found = true;
					// uid pode ser um array ou string
					const uid = Array.isArray(entry.object.uid)
						? entry.object.uid[0]
						: entry.object.uid;
					// mail pode ser um array ou string
					const mail = Array.isArray(entry.object.mail)
						? entry.object.mail[0]
						: entry.object.mail;
					// uffsEmailAlternativo pode ser um array ou string
					const uffsEmailAlternativo = Array.isArray(
						entry.object.uffsEmailAlternativo,
					)
						? entry.object.uffsEmailAlternativo[0]
						: entry.object.uffsEmailAlternativo;
					client.unbind();
					resolve({
						uid: uid || null,
						mail: mail || null,
						uffsEmailAlternativo: uffsEmailAlternativo || null,
					});
				});

				res.on("error", (err) => {
					client.unbind();
					reject(new Error(`Erro na busca LDAP: ${err.message}`));
				});

				res.on("end", (result) => {
					if (!found) {
						client.unbind();
						resolve(null);
					}
				});
			});
		});
	});
}

/**
 * Função principal
 */
async function main() {
	console.log("Iniciando busca de dicentes no LDAP...\n");

	try {
		// Testar conexão com o banco
		await sequelize.authenticate();
		console.log("Conexão com banco de dados estabelecida\n");

		// Carregar modelos
		const Dicente = require(path.join(
			__dirname,
			"../src/models/dicente.js",
		))(sequelize, Sequelize.DataTypes);
		const Usuario = require(path.join(
			__dirname,
			"../src/models/usuario.js",
		))(sequelize, Sequelize.DataTypes);
		const UsuarioCurso = require(path.join(
			__dirname,
			"../src/models/usuario-curso.js",
		))(sequelize, Sequelize.DataTypes);
		const UsuarioGrupo = require(path.join(
			__dirname,
			"../src/models/usuario-grupo.js",
		))(sequelize, Sequelize.DataTypes);

		// Buscar todos os dicentes
		console.log("Buscando dicentes no banco de dados...");
		const dicentes = await Dicente.findAll({
			order: [["nome", "ASC"]],
		});

		console.log(`Encontrados ${dicentes.length} dicentes\n`);
		console.log("=".repeat(80));
		console.log("PROCESSANDO DICENTES E CRIANDO USUÁRIOS");
		console.log("=".repeat(80));

		let encontrados = 0;
		let naoEncontrados = 0;
		let erros = 0;
		let usuariosCriados = 0;
		let usuariosAtualizados = 0;
		let dicentesAtualizados = 0;
		let cursosAssociados = 0;
		let gruposAssociados = 0;

		// Processar cada dicente
		for (const dicente of dicentes) {
			const transaction = await sequelize.transaction();
			try {
				const resultado = await buscarUidPorCn(dicente.nome);

				if (resultado && resultado.uid) {
					const uid = resultado.uid;
					const mail = resultado.mail || null;
					const uffsEmailAlternativo = resultado.uffsEmailAlternativo || null;

					// 1. Criar ou atualizar usuário
					const [usuario, usuarioCriado] = await Usuario.findOrCreate({
						where: { id: uid },
						defaults: {
							id: uid,
							nome: dicente.nome,
							email: mail,
						},
						transaction,
					});

					// Se o usuário já existia, atualizar nome e email se necessário
					if (!usuarioCriado) {
						const precisaAtualizar =
							usuario.nome !== dicente.nome || usuario.email !== mail;
						if (precisaAtualizar) {
							await usuario.update(
								{
									nome: dicente.nome,
									email: mail,
								},
								{ transaction },
							);
							usuariosAtualizados++;
						}
					} else {
						usuariosCriados++;
					}

					// 2. Atualizar dicente com id_usuario e email alternativo
					const emailAtualizado = uffsEmailAlternativo
						? uffsEmailAlternativo
						: dicente.email;
					await dicente.update(
						{
							id_usuario: uid,
							email: emailAtualizado,
						},
						{ transaction },
					);
					dicentesAtualizados++;

					// 3. Criar registro em usuario_curso (id_curso = 1)
					const [usuarioCurso, cursoCriado] =
						await UsuarioCurso.findOrCreate({
							where: {
								id_usuario: uid,
								id_curso: 1,
							},
							defaults: {
								id_usuario: uid,
								id_curso: 1,
							},
							transaction,
						});
					if (cursoCriado) {
						cursosAssociados++;
					}

					// 4. Criar registro em usuario_grupo (id_grupo = 4)
					const [usuarioGrupo, grupoCriado] =
						await UsuarioGrupo.findOrCreate({
							where: {
								id_usuario: uid,
								id_grupo: 4,
							},
							defaults: {
								id_usuario: uid,
								id_grupo: 4,
							},
							transaction,
						});
					if (grupoCriado) {
						gruposAssociados++;
					}

					await transaction.commit();

					console.log(
						`✓ Matrícula: ${dicente.matricula} | Nome: ${dicente.nome} | UID: ${uid} | Mail: ${mail || "N/A"} | Email Alternativo: ${uffsEmailAlternativo || "N/A"}`,
					);
					encontrados++;
				} else {
					await transaction.rollback();
					console.log(
						`✗ Matrícula: ${dicente.matricula} | Nome: ${dicente.nome} | UID: Não encontrado no LDAP`,
					);
					naoEncontrados++;
				}
			} catch (error) {
				await transaction.rollback();
				console.error(
					`✗ Matrícula: ${dicente.matricula} | Nome: ${dicente.nome} | Erro: ${error.message}`,
				);
				erros++;
			}
		}

		// Resumo final
		console.log("\n" + "=".repeat(80));
		console.log("RESUMO");
		console.log("=".repeat(80));
		console.log(`Total de dicentes: ${dicentes.length}`);
		console.log(`Encontrados no LDAP: ${encontrados}`);
		console.log(`Não encontrados: ${naoEncontrados}`);
		console.log(`Erros: ${erros}`);
		console.log(`\nUsuários criados: ${usuariosCriados}`);
		console.log(`Usuários atualizados: ${usuariosAtualizados}`);
		console.log(`Dicentes atualizados: ${dicentesAtualizados}`);
		console.log(`Associações curso criadas: ${cursosAssociados}`);
		console.log(`Associações grupo criadas: ${gruposAssociados}`);
		console.log("=".repeat(80));
	} catch (error) {
		console.error("\nErro fatal:", error.message);
		console.error(error.stack);
		process.exit(1);
	} finally {
		await sequelize.close();
	}
}

// Executar
main();

