import { IsArray, IsInt, IsOptional, IsString } from "class-validator";

/** Campos opcionais de propósito: DefesasService replica a validação manual do legado
 * (mensagem "Parâmetros inválidos"). */
export class AgendarDefesaDto {
	@IsOptional()
	@IsInt()
	id_tcc?: number;

	@IsOptional()
	@IsInt()
	fase?: number;

	@IsOptional()
	@IsString()
	data?: string;

	@IsOptional()
	@IsString()
	hora?: string;

	@IsOptional()
	@IsString()
	codigo_orientador?: string;

	@IsOptional()
	@IsArray()
	membros_banca?: string[];
}
