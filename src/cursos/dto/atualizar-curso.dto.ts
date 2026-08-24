import { IsInt, IsOptional, IsString } from "class-validator";

export class AtualizarCursoDto {
	@IsInt()
	id!: number;

	@IsOptional()
	@IsInt()
	codigo?: number;

	@IsOptional()
	@IsString()
	nome?: string;

	@IsOptional()
	@IsString()
	turno?: string;

	@IsOptional()
	@IsString()
	coordenador?: string;
}
