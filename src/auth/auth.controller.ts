import { Body, Controller, Get, HttpException, Logger, Post, UseGuards } from "@nestjs/common";
import { UsuarioEntity } from "../database/entities";
import { UsuarioAtual } from "../common/decorators/usuario-atual.decorator";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { TokenDto } from "./dto/token.dto";

/** Porta de src/resources/auth-resource.js. Mesmos paths, status codes e shapes de resposta. */
@Controller("auth")
export class AuthController {
	private readonly logger = new Logger(AuthController.name);

	constructor(private readonly authService: AuthService) {}

	@Post("login")
	async login(@Body() body: LoginDto) {
		const { userId, senha } = body;

		if (!userId) {
			throw new HttpException({ message: "ID do usuário é obrigatório" }, 400);
		}

		try {
			const resultado = await this.authService.fazerLogin(userId, senha ?? null);
			return { message: "Login realizado com sucesso", ...resultado };
		} catch (error) {
			const mensagem = (error as Error).message;

			if (mensagem === "Usuário não encontrado") {
				throw new HttpException({ message: "Credenciais incorretas." }, 401);
			}

			if (mensagem === "Senha é obrigatória") {
				throw new HttpException({ message: "Senha é obrigatória" }, 400);
			}

			if (mensagem === "Senha incorreta" || mensagem === "Credenciais inválidas") {
				throw new HttpException({ message: "Credenciais incorretas." }, 401);
			}

			this.logger.error(
				`Falha inesperada ao autenticar o usuário ${userId}: ${mensagem}`,
				(error as Error).stack,
			);
			throw new HttpException({ message: "Erro interno do servidor" }, 500);
		}
	}

	@Post("refresh")
	async refresh(@Body() body: TokenDto) {
		const { token } = body;

		if (!token) {
			throw new HttpException({ message: "Token é obrigatório" }, 400);
		}

		try {
			const novoToken = await this.authService.renovarToken(token);
			return { message: "Token renovado com sucesso", token: novoToken };
		} catch (error) {
			if ((error as Error).message === "Token inválido") {
				throw new HttpException({ message: "Token inválido ou expirado" }, 401);
			}

			throw new HttpException({ message: "Erro interno do servidor" }, 500);
		}
	}

	@UseGuards(JwtAuthGuard)
	@Get("me")
	async me(@UsuarioAtual() usuario: UsuarioEntity) {
		try {
			const dadosUsuario = await this.authService.buscarDadosUsuario(usuario.id as string);
			return { message: "Dados do usuário recuperados com sucesso", usuario: dadosUsuario };
		} catch {
			throw new HttpException({ message: "Erro interno do servidor" }, 500);
		}
	}

	@UseGuards(JwtAuthGuard)
	@Post("logout")
	async logout() {
		return { message: "Logout realizado com sucesso" };
	}

	@Post("validate")
	async validate(@Body() body: TokenDto) {
		const { token } = body;

		if (!token) {
			throw new HttpException({ message: "Token é obrigatório" }, 400);
		}

		try {
			const payload = this.authService.validarToken(token);
			return {
				message: "Token válido",
				payload: {
					userId: payload.userId,
					nome: payload.nome,
					exp: payload.exp,
				},
			};
		} catch (error) {
			if ((error as Error).message === "Token inválido") {
				throw new HttpException({ message: "Token inválido ou expirado" }, 401);
			}

			throw new HttpException({ message: "Erro interno do servidor" }, 500);
		}
	}
}
