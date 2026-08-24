import { IsArray, IsInt, IsOptional, IsString } from "class-validator";

export class GerenciarBancaDto {
	@IsOptional()
	@IsInt()
	id_tcc?: number;

	@IsOptional()
	@IsInt()
	fase?: number;

	@IsOptional()
	@IsArray()
	membros_novos?: string[];

	@IsOptional()
	@IsArray()
	membros_existentes?: string[];

	@IsOptional()
	@IsArray()
	convites_banca_existentes?: { codigo_docente: string; aceito: boolean }[];

	@IsOptional()
	@IsString()
	orientador_codigo?: string;

	@IsOptional()
	@IsString()
	data_hora_defesa?: string;

	@IsOptional()
	@IsArray()
	alteracoes?: { membro_antigo: string; membro_novo: string }[];
}
