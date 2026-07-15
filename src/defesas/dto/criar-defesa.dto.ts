import { IsBoolean, IsInt, IsOptional, IsString } from "class-validator";

export class CriarDefesaDto {
	@IsInt()
	id_tcc!: number;

	@IsOptional()
	@IsString()
	membro_banca?: string;

	@IsInt()
	fase!: number;

	@IsOptional()
	@IsBoolean()
	orientador?: boolean;
}
