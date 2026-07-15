import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import * as bcrypt from "bcrypt";
import { Strategy } from "passport-local";
import { UsuarioEntity } from "../../database/entities";
import { AuthRepository } from "../auth.repository";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, "local") {
	constructor(private readonly authRepository: AuthRepository) {
		super({ usernameField: "userId", passwordField: "senha" });
	}

	async validate(userId: string, senha: string): Promise<UsuarioEntity> {
		const usuario = await this.authRepository.buscarUsuarioPorId(userId);

		if (!usuario?.passwd || !(await bcrypt.compare(senha, usuario.passwd))) {
			throw new UnauthorizedException("Credenciais inválidas");
		}

		return usuario;
	}
}
