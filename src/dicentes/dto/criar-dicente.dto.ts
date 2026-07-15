import { IsString } from "class-validator";

export class CriarDicenteDto {
	@IsString()
	matricula!: string;

	@IsString()
	nome!: string;

	@IsString()
	email!: string;
}
