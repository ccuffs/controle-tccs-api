import { IsOptional, IsString } from "class-validator";

export class AtualizarDicenteDto {
	@IsOptional()
	@IsString()
	matricula?: string;

	@IsOptional()
	@IsString()
	nome?: string;

	@IsOptional()
	@IsString()
	email?: string;
}
