import { CanActivate, ExecutionContext, HttpException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Request } from "express";
import { UsuarioEntity } from "../../database/entities";
import { PermissoesService } from "../../permissoes/permissoes.service";
import { GRUPOS_KEY } from "../decorators/grupos.decorator";

/** Porta de src/middleware/autorizacao.js `autorizacao.verificarPermissaoGrupo`. */
@Injectable()
export class GruposGuard implements CanActivate {
	constructor(
		private readonly reflector: Reflector,
		private readonly permissoesService: PermissoesService,
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const gruposIds = this.reflector.getAllAndOverride<number[]>(GRUPOS_KEY, [
			context.getHandler(),
			context.getClass(),
		]);

		if (!gruposIds) {
			return true;
		}

		const request = context.switchToHttp().getRequest<Request & { user?: UsuarioEntity }>();

		if (!request.user) {
			throw new HttpException({ message: "Usuário não autenticado" }, 401);
		}

		if (gruposIds.length === 0) {
			throw new HttpException({ message: "Acesso negado" }, 403);
		}

		try {
			const gruposUsuario = await this.permissoesService.buscarGruposDoUsuario(request.user.id as string);
			const autorizado = gruposUsuario.some((g) => gruposIds.includes(g.id));

			if (!autorizado) {
				throw new HttpException({ message: "Permissão negada" }, 403);
			}

			return true;
		} catch (error) {
			if (error instanceof HttpException) {
				throw error;
			}
			throw new HttpException({ message: "Erro interno do servidor na verificação de grupo" }, 500);
		}
	}
}
