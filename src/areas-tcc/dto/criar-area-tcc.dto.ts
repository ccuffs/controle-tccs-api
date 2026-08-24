import { IsString } from "class-validator";

export class CriarAreaTccDto {
	@IsString()
	descricao!: string;

	@IsString()
	codigo_docente!: string;
}
