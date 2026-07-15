import { IsInt, IsOptional, IsString } from "class-validator";

export class AtualizarAreaTccDto {
	@IsInt()
	id!: number;

	@IsOptional()
	@IsString()
	descricao?: string;

	@IsOptional()
	@IsString()
	codigo_docente?: string;
}
