import { IsBoolean, IsInt, IsOptional, IsString } from "class-validator";

export class CriarTemaTccDto {
	@IsString()
	descricao!: string;

	@IsInt()
	id_area_tcc!: number;

	@IsString()
	codigo_docente!: string;

	@IsOptional()
	@IsBoolean()
	ativo?: boolean;
}
