import { IsDateString, IsOptional } from "class-validator";

export class AtualizarDataDefesaDto {
	@IsOptional()
	@IsDateString()
	inicio?: string;

	@IsOptional()
	@IsDateString()
	fim?: string;
}
