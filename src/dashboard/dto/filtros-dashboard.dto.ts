import { IsIn, IsNumberString, IsOptional, IsString } from "class-validator";

/**
 * Os decoradores são obrigatórios: com `ValidationPipe({ whitelist: true })` global,
 * propriedades sem metadados do class-validator são removidas da query.
 */
export class FiltrosDashboardDto {
	@IsOptional()
	@IsNumberString()
	ano?: string;

	@IsOptional()
	@IsNumberString()
	semestre?: string;

	@IsOptional()
	@IsNumberString()
	id_curso?: string;

	@IsOptional()
	@IsNumberString()
	fase?: string;

	@IsOptional()
	@IsString()
	codigo_docente?: string;

	/** defesas-agendadas: apenas defesas entre agora e agora + `dias`. */
	@IsOptional()
	@IsNumberString()
	dias?: string;

	/** convites-*-status: idade mínima (em dias) para um convite pendente contar como antigo. Padrão 5. */
	@IsOptional()
	@IsNumberString()
	dias_pendencia?: string;

	/** defesas-agendadas: filtra pelo status derivado da defesa. */
	@IsOptional()
	@IsIn(["agendada", "aguardando_confirmacao", "concluida"])
	status?: "agendada" | "aguardando_confirmacao" | "concluida";

	/** defesas-agendadas: "true" busca em todos os períodos (ano/semestre viram filtros opcionais). */
	@IsOptional()
	@IsIn(["true", "false"])
	incluir_historico?: string;
}
