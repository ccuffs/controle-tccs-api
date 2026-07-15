import { IsBoolean, IsInt, IsOptional, IsString } from "class-validator";

export class AtualizarTrabalhoConclusaoDto {
	@IsOptional()
	@IsInt()
	ano?: number;

	@IsOptional()
	@IsInt()
	semestre?: number;

	@IsOptional()
	@IsInt()
	id_curso?: number;

	@IsOptional()
	@IsInt()
	fase?: number;

	@IsOptional()
	@IsString()
	matricula?: string;

	@IsOptional()
	@IsString()
	tema?: string;

	@IsOptional()
	@IsString()
	titulo?: string;

	@IsOptional()
	@IsString()
	resumo?: string;

	@IsOptional()
	@IsString()
	seminario_andamento?: string;

	@IsOptional()
	@IsInt()
	etapa?: number;

	@IsOptional()
	@IsBoolean()
	aprovado_projeto?: boolean;

	@IsOptional()
	@IsBoolean()
	aprovado_tcc?: boolean;

	@IsOptional()
	@IsString()
	comentarios_tcc?: string;
}
