import { IsInt, IsOptional, IsString } from "class-validator";

export class CriarTrabalhoConclusaoDto {
	@IsInt()
	ano!: number;

	@IsInt()
	semestre!: number;

	@IsInt()
	id_curso!: number;

	@IsInt()
	fase!: number;

	@IsString()
	matricula!: string;

	@IsOptional()
	@IsString()
	tema?: string;

	@IsOptional()
	@IsString()
	titulo?: string;

	@IsOptional()
	@IsString()
	resumo?: string;
}
