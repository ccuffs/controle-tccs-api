import { IsDateString, IsInt, IsOptional } from "class-validator";

export class CriarDataDefesaDto {
	@IsInt()
	ano!: number;

	@IsInt()
	semestre!: number;

	@IsInt()
	id_curso!: number;

	@IsInt()
	fase!: number;

	@IsOptional()
	@IsDateString()
	inicio?: string;

	@IsOptional()
	@IsDateString()
	fim?: string;
}
