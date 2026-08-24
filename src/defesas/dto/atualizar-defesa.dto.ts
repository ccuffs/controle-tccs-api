import { IsBoolean, IsDateString, IsInt, IsOptional } from "class-validator";

export class AtualizarDefesaDto {
	@IsOptional()
	@IsDateString()
	data_defesa?: string;

	@IsOptional()
	avaliacao?: number;

	@IsOptional()
	@IsBoolean()
	orientador?: boolean;

	@IsOptional()
	@IsInt()
	fase?: number;
}
