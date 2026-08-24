import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { SequelizeModule } from "@nestjs/sequelize";
import { ENTITIES } from "./entities";

/**
 * Lê as mesmas variáveis de ambiente que src/config/database.js (usado pelo
 * sequelize-cli). As migrations continuam sendo a fonte de verdade do schema;
 * esta conexão só registra as entities sequelize-typescript equivalentes.
 *
 * Todas as entities são registradas aqui (não só via SequelizeModule.forFeature
 * em cada módulo de feature): tabelas de junção como UsuarioCursoEntity nunca são
 * injetadas diretamente em um service, mas precisam estar carregadas no Sequelize
 * porque são referenciadas como `through` em associações belongsToMany.
 */
@Module({
	imports: [
		SequelizeModule.forRootAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (config: ConfigService) => ({
				dialect: "postgres",
				host: config.get<string>("DBHOST"),
				port: config.get<number>("DBPORT", 5432),
				username: config.get<string>("DBUSER"),
				password: config.get<string>("DBPASS"),
				database: config.get<string>("DBNAME"),
				schema: "public",
				logging: config.get<string>("NODE_ENV", "development") === "development" ? console.log : false,
				models: ENTITIES,
				autoLoadModels: true,
				synchronize: false,
			}),
		}),
	],
})
export class DatabaseModule {}
