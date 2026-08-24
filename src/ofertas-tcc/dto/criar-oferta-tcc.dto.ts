import { IsInt } from "class-validator";

export class CriarOfertaTccDto {
	@IsInt()
	ano!: number;

	@IsInt()
	semestre!: number;

	@IsInt()
	id_curso!: number;

	@IsInt()
	fase!: number;
}
