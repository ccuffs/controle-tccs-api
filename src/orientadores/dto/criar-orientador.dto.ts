import { IsInt, IsString } from "class-validator";

export class CriarOrientadorDto {
	@IsInt()
	id_curso!: number;

	@IsString()
	codigo_docente!: string;
}
