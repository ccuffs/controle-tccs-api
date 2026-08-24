import { CanActivate, ExecutionContext, HttpException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Request } from "express";
import { UsuarioEntity } from "../../database/entities";
import { PermissoesService } from "../../permissoes/permissoes.service";
import { PERMISSOES_KEY } from "../decorators/permissoes.decorator";

/** Porta de src/middleware/autorizacao.js `autorizacao.verificarPermissao`. */
@Injectable()
export class PermissoesGuard implements CanActivate {
	constructor(
		private readonly reflector: Reflector,
		private readonly permissoesService: PermissoesService,
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const permissoesIds = this.reflector.getAllAndOverride<number[]>(PERMISSOES_KEY, [
			context.getHandler(),
			context.getClass(),
		]);

		if (!permissoesIds || permissoesIds.length === 0) {
			return true;
		}

		const request = context.switchToHttp().getRequest<Request & { user?: UsuarioEntity }>();

		if (!request.user) {
			throw new HttpException({ message: "Usuário não autenticado" }, 401);
		}

		const userId = request.user.id as string;

		try {
			const permissoesUsuario = await this.permissoesService.buscarPermissoesDoUsuario(userId);

			for (const idPermissao of permissoesIds) {
				const temPermissao = permissoesUsuario.some((permissao) => permissao.id === idPermissao);
				if (temPermissao) {
					return true;
				}
			}

			const permissoesStr = permissoesIds.join(" ou ");
			throw new HttpException(
				{ message: `Permissão negada: usuário não possui as permissões necessárias (${permissoesStr})` },
				403,
			);
		} catch (error) {
			if (error instanceof HttpException) {
				throw error;
			}
			throw new HttpException(
				{ message: "Erro interno do servidor na verificação de permissão" },
				500,
			);
		}
	}
}
