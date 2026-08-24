import { HttpException, Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

/**
 * Porta de src/middleware/auth.js `auth.autenticarUsuario`: mesmas respostas
 * de erro (401 com token inválido/expirado, 500 em erro interno da autenticação).
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
	handleRequest<TUser = unknown>(err: unknown, user: TUser): TUser {
		if (err) {
			throw new HttpException({ message: "Erro interno do servidor na autenticação" }, 500);
		}

		if (!user) {
			throw new UnauthorizedException({ message: "Token inválido ou expirado" });
		}

		return user;
	}
}
