import { IsBoolean, IsInt, IsOptional, IsString } from "class-validator";

export class AtualizarTemaTccDto {
	@IsInt()
	id!: number;

	@IsOptional()
	@IsString()
	descricao?: string;

	@IsOptional()
	@IsInt()
	id_area_tcc?: number;

	@IsOptional()
	@IsString()
	codigo_docente?: string;

	@IsOptional()
	@IsBoolean()
	ativo?: boolean;
}
