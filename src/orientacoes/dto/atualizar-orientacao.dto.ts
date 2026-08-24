import { IsBoolean, IsInt, IsOptional, IsString } from "class-validator";

export class AtualizarOrientacaoDto {
	@IsInt()
	id!: number;

	@IsOptional()
	@IsString()
	codigo_docente?: string;

	@IsOptional()
	@IsInt()
	id_tcc?: number;

	@IsOptional()
	@IsBoolean()
	orientador?: boolean;
}
