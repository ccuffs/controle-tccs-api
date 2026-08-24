import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { SequelizeModule } from "@nestjs/sequelize";
import { CursoEntity, GrupoEntity, UsuarioEntity } from "../database/entities";
import { PermissoesModule } from "../permissoes/permissoes.module";
import { AuthController } from "./auth.controller";
import { AuthRepository } from "./auth.repository";
import { AuthService } from "./auth.service";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { LdapStrategy } from "./strategies/ldap.strategy";
import { LocalStrategy } from "./strategies/local.strategy";

@Module({
	imports: [
		SequelizeModule.forFeature([UsuarioEntity, GrupoEntity, CursoEntity]),
		PassportModule,
		JwtModule.register({
			secret: process.env.JWT_SECRET || "sua-chave-secreta-padrao",
			signOptions: { algorithm: "HS256" },
		}),
		PermissoesModule,
	],
	controllers: [AuthController],
	providers: [AuthService, AuthRepository, JwtStrategy, LdapStrategy, LocalStrategy],
	exports: [AuthService],
})
export class AuthModule {}
