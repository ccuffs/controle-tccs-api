import { IsBoolean, IsInt, IsOptional, IsString } from "class-validator";

export class CriarDocenteDto {
	@IsString()
	codigo!: string;

	@IsString()
	email!: string;

	@IsOptional()
	@IsString()
	nome?: string;

	@IsOptional()
	@IsInt()
	sala?: number;

	@IsOptional()
	@IsInt()
	siape?: number;

	@IsOptional()
	@IsBoolean()
	externo?: boolean;

	@IsOptional()
	@IsString()
	instituicao?: string;

	@IsOptional()
	@IsString()
	id_usuario?: string;
}
