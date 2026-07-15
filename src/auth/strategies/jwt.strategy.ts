import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { InjectModel } from "@nestjs/sequelize";
import { ExtractJwt, Strategy } from "passport-jwt";
import { UsuarioEntity } from "../../database/entities";

interface JwtPayload {
	userId: string;
	email: string;
	nome: string;
	iat: number;
	exp: number;
}

/** Porta de src/middleware/auth.js (estratégia JWT do Passport). */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt") {
	constructor(
		@InjectModel(UsuarioEntity)
		private readonly usuarioModel: typeof UsuarioEntity,
	) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			secretOrKey: process.env.JWT_SECRET || "sua-chave-secreta-padrao",
			algorithms: ["HS256"],
		});
	}

	async validate(payload: JwtPayload): Promise<UsuarioEntity | false> {
		const usuario = await this.usuarioModel.findByPk(payload.userId);

		if (!usuario) {
			return false;
		}

		return usuario;
	}
}
