import { IsBoolean, IsInt, IsOptional, IsString } from "class-validator";

export class CriarConviteDto {
	@IsInt()
	id_tcc!: number;

	@IsString()
	codigo_docente!: string;

	@IsOptional()
	@IsInt()
	fase?: number;

	@IsOptional()
	@IsString()
	mensagem_envio?: string;

	@IsOptional()
	@IsString()
	mensagem_feedback?: string;

	@IsOptional()
	data_feedback?: Date;

	@IsOptional()
	@IsBoolean()
	orientacao?: boolean;
}
