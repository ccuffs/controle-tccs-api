import { IsInt, IsOptional, IsString } from "class-validator";

export class DadosDocenteExternoDto {
	@IsOptional()
	@IsString()
	codigo?: string;

	@IsOptional()
	@IsString()
	nome?: string;

	@IsOptional()
	@IsString()
	email?: string;

	@IsOptional()
	siape?: number;

	@IsOptional()
	@IsString()
	instituicao?: string;
}

export class AdicionarMembroExternoDto {
	@IsOptional()
	@IsInt()
	id_tcc?: number;

	@IsOptional()
	@IsInt()
	fase?: number;

	@IsOptional()
	@IsString()
	data_hora_defesa?: string;

	@IsOptional()
	docente?: DadosDocenteExternoDto;
}
