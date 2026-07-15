import { IsOptional, IsString } from "class-validator";

/**
 * userId/senha ficam opcionais no DTO de propósito: o AuthController replica a
 * validação manual do auth-resource.js legado (mensagens de erro específicas por
 * campo), em vez de deixar o ValidationPipe global rejeitar com o shape padrão do Nest.
 */
export class LoginDto {
	@IsOptional()
	@IsString()
	userId?: string;

	@IsOptional()
	@IsString()
	senha?: string;
}
