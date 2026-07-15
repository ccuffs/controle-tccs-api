import { IsBoolean, IsInt, IsOptional, IsString } from "class-validator";

export class CriarOrientacaoDto {
	@IsString()
	codigo_docente!: string;

	@IsInt()
	id_tcc!: number;

	@IsOptional()
	@IsBoolean()
	orientador?: boolean;
}
