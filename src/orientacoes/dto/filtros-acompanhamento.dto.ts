import { IsIn, IsNumberString, IsOptional, IsString, MaxLength } from "class-validator";

export class FiltrosAcompanhamentoDto {
	/** Busca por nome do discente, matrícula ou nome do orientador. */
	@IsOptional()
	@IsString()
	@MaxLength(100)
	q?: string;

	@IsOptional()
	@IsNumberString()
	id_curso?: string;

	@IsOptional()
	@IsNumberString()
	ano?: string;

	@IsOptional()
	@IsNumberString()
	semestre?: string;

	/** "A partir de" (opção "Todos os períodos" restrita): período >= desde_ano/desde_semestre. */
	@IsOptional()
	@IsNumberString()
	desde_ano?: string;

	@IsOptional()
	@IsIn(["1", "2"])
	desde_semestre?: string;

	@IsOptional()
	@IsIn(["1", "2"])
	fase?: string;

	/** Apenas TCCs em que o docente participa da orientação (orientador ou coorientador).
	 * Ignorado para quem não tem ORIENTACAO.VISUALIZAR_TODAS: nesse caso vale o docente logado. */
	@IsOptional()
	@IsString()
	codigo_docente?: string;

	@IsOptional()
	@IsNumberString()
	pagina?: string;

	@IsOptional()
	@IsNumberString()
	limite?: string;
}
