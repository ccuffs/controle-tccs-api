import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { Request } from "express";
import { UsuarioEntity } from "../../database/entities";

/** Extrai o usuário autenticado (setado pelo JwtAuthGuard/JwtStrategy em request.user). */
export const UsuarioAtual = createParamDecorator((_data: unknown, ctx: ExecutionContext): UsuarioEntity => {
	const request = ctx.switchToHttp().getRequest<Request & { user: UsuarioEntity }>();
	return request.user;
});
