import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import passport from "passport";
import { UsuarioEntity } from "../database/entities";
import { PermissoesService } from "../permissoes/permissoes.service";
import { AuthRepository } from "./auth.repository";
import { LocalStrategy } from "./strategies/local.strategy";

interface JwtPayload {
	userId: string;
	email: string | null;
	nome: string | null;
	iat: number;
	exp: number;
}

interface DadosLoginLdap {
	id: string;
	nome: string;
	email: string;
}

@Injectable()
export class AuthService implements OnModuleInit {
	private readonly logger = new Logger(AuthService.name);

	constructor(
		private readonly jwtService: JwtService,
		private readonly authRepository: AuthRepository,
		private readonly permissoesService: PermissoesService,
		private readonly localStrategy: LocalStrategy,
	) {}

	onModuleInit(): void {
		if (!this.isLdapEnabled()) {
			this.logger.warn(
				"LDAP desabilitado: o login será realizado via usuário e senha local.",
			);
		}
	}

	gerarToken(usuario: UsuarioEntity): string {
		const payload: JwtPayload = {
			userId: usuario.id as string,
			email: usuario.email as string | null,
			nome: usuario.nome as string | null,
			iat: Math.floor(Date.now() / 1000),
			exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
		};

		// Sem `expiresIn`: o payload já carrega iat/exp calculados manualmente, igual ao legado.
		return this.jwtService.sign(payload as unknown as Record<string, unknown>);
	}

	private isLdapEnabled(): boolean {
		const enabled = process.env.LDAP_ENABLED;
		return enabled === undefined || enabled === "true" || enabled === "1";
	}

	private autenticarLdap(userId: string, senha: string): Promise<DadosLoginLdap> {
		return new Promise((resolve, reject) => {
			const req = {
				body: {
					username: userId,
					password: senha,
				},
			};

			passport.authenticate(
				"ldapauth",
				{ session: false },
				(err: unknown, user: DadosLoginLdap | false) => {
					if (err) {
						reject(err as Error);
						return;
					}

					if (!user) {
						reject(new Error("Credenciais inválidas"));
						return;
					}

					resolve(user);
				},
			)(req as never);
		});
	}

	async fazerLogin(userId: string, senha: string | null = null) {
		const ldapEnabled = this.isLdapEnabled();

		if (ldapEnabled) {
			if (!senha) {
				throw new Error("Senha é obrigatória");
			}

			const dadosLdap = await this.autenticarLdap(userId, senha);
			const usuario = await this.authRepository.buscarUsuarioPorId(dadosLdap.id);

			if (!usuario) {
				throw new Error("Usuário não encontrado");
			}

			return this.montarRespostaLogin(usuario);
		}

		if (!senha) {
			throw new Error("Senha é obrigatória");
		}

		const usuario = await this.localStrategy.validate(userId, senha);

		return this.montarRespostaLogin(usuario);
	}

	private montarRespostaLogin(usuario: UsuarioEntity) {
		const token = this.gerarToken(usuario);
		const grupos = usuario.grupos ?? [];

		return {
			token,
			usuario: {
				id: usuario.id,
				nome: usuario.nome,
				email: usuario.email,
				grupos: grupos.map((grupo) => ({
					id: grupo.id,
					nome: grupo.nome,
					descricao: grupo.descricao,
					consulta_todos: (grupo as unknown as { consulta_todos?: unknown }).consulta_todos,
				})),
			},
		};
	}

	validarToken(token: string): JwtPayload {
		try {
			return this.jwtService.verify<JwtPayload>(token, { algorithms: ["HS256"] });
		} catch {
			throw new Error("Token inválido");
		}
	}

	async renovarToken(token: string): Promise<string> {
		const payload = this.validarToken(token);
		const usuario = await this.authRepository.buscarUsuarioPorIdSimples(payload.userId);

		if (!usuario) {
			throw new Error("Usuário não encontrado");
		}

		return this.gerarToken(usuario);
	}

	async buscarDadosUsuario(userId: string) {
		const usuario = await this.authRepository.buscarUsuarioPorId(userId);

		if (!usuario) {
			throw new Error("Usuário não encontrado");
		}

		const permissoes = await this.permissoesService.buscarPermissoesDoUsuario(userId);
		const temConsultaTodos = await this.permissoesService.verificarConsultaTodos(userId);

		return {
			id: usuario.id,
			nome: usuario.nome,
			email: usuario.email,
			grupos: usuario.grupos,
			cursos: usuario.cursos,
			permissoes,
			temConsultaTodos,
		};
	}

	async buscarPermissoesUsuario(userId: string) {
		const permissoes = await this.permissoesService.buscarPermissoesDoUsuario(userId);
		const temConsultaTodos = await this.permissoesService.verificarConsultaTodos(userId);

		return { permissoes, temConsultaTodos };
	}
}
