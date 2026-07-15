import { IsInt, IsOptional, IsString } from "class-validator";

/** Campos opcionais no DTO de propósito: o service replica a validação manual do
 * legado (`Todos os campos são obrigatórios`), em vez do shape padrão do ValidationPipe. */
export class CriarDisponibilidadeDto {
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
	codigo_docente?: string;

	@IsOptional()
	@IsString()
	data_defesa?: string;

	@IsOptional()
	@IsString()
	hora_defesa?: string;
}
