import { Injectable } from "@nestjs/common";
import { Op } from "sequelize";
import { AnoSemestreService } from "../ano-semestre/ano-semestre.service";
import { rotuloEtapa, rotuloFase } from "../common/etapas-tcc";
import { CursoEntity, DicenteEntity, DocenteEntity, OrientacaoEntity, TrabalhoConclusaoEntity } from "../database/entities";
import { DashboardRepository } from "./dashboard.repository";
import { FiltrosDashboardDto } from "./dto/filtros-dashboard.dto";

interface OfertaAlvo {
	ano: number;
	semestre: number;
}

@Injectable()
export class DashboardService {
	constructor(
		private readonly dashboardRepository: DashboardRepository,
		private readonly anoSemestreService: AnoSemestreService,
	) {}

	private async resolverOfertaAlvo(ano?: string, semestre?: string): Promise<OfertaAlvo> {
		if (ano && semestre) {
			return { ano: parseInt(ano, 10), semestre: parseInt(semestre, 10) };
		}
		const atual = await this.anoSemestreService.calcularAnoSemestreAtual();
		return { ano: atual.ano, semestre: atual.semestre };
	}

	async calcularDicentesComOrientador(filtros: FiltrosDashboardDto) {
		const { id_curso, fase } = filtros;
		const { ano: anoAlvo, semestre: semestreAlvo } = await this.resolverOfertaAlvo(filtros.ano, filtros.semestre);

		const tccWhere: Record<string, number> = { ano: anoAlvo, semestre: semestreAlvo };
		if (fase) tccWhere.fase = parseInt(fase, 10);
		if (id_curso) tccWhere.id_curso = parseInt(id_curso, 10);

		const atual = await this.contarComOrientador(tccWhere);

		// Comparação com o período letivo anterior (mesmo curso e fase), usada nos KPIs
		// "+N neste período" e "+X p.p." da Visão geral.
		const anterior = await this.dashboardRepository.buscarPeriodoAnterior(anoAlvo, semestreAlvo);
		let periodoAnterior: { ano: number; semestre: number; total: number; comOrientador: number; percentual: number } | null =
			null;
		if (anterior) {
			const anoAnt = Number(anterior.ano);
			const semestreAnt = Number(anterior.semestre);
			const contagem = await this.contarComOrientador({ ...tccWhere, ano: anoAnt, semestre: semestreAnt });
			periodoAnterior = { ano: anoAnt, semestre: semestreAnt, ...contagem };
		}

		return {
			ano: anoAlvo,
			semestre: semestreAlvo,
			fase: fase ? parseInt(fase, 10) : undefined,
			id_curso: id_curso ? parseInt(id_curso, 10) : undefined,
			total: atual.total,
			comOrientador: atual.comOrientador,
			percentual: atual.percentual,
			periodo_anterior: periodoAnterior,
			variacao_total: periodoAnterior ? atual.total - periodoAnterior.total : null,
			variacao_percentual: periodoAnterior
				? Math.round((atual.percentual - periodoAnterior.percentual) * 10) / 10
				: null,
		};
	}

	private async contarComOrientador(tccWhere: Record<string, number>) {
		const total = await this.dashboardRepository.contarTccsNaOferta(tccWhere);
		const comOrientador = await this.dashboardRepository.contarTccsComOrientador(tccWhere, [
			{ model: OrientacaoEntity, required: true, where: { orientador: true } },
		]);
		const percentual = total > 0 ? Math.round((comOrientador / total) * 1000) / 10 : 0;
		return { total, comOrientador, percentual };
	}

	async calcularTccPorEtapa(filtros: FiltrosDashboardDto) {
		const { id_curso, fase, codigo_docente } = filtros;
		const { ano: anoAlvo, semestre: semestreAlvo } = await this.resolverOfertaAlvo(filtros.ano, filtros.semestre);

		const where: Record<string, number> = { ano: anoAlvo, semestre: semestreAlvo };
		if (fase) where.fase = parseInt(fase, 10);
		if (id_curso) where.id_curso = parseInt(id_curso, 10);

		const include = codigo_docente
			? [
					{
						model: OrientacaoEntity,
						required: true,
						attributes: [],
						where: { codigo_docente: String(codigo_docente), orientador: true },
					},
				]
			: [];

		const resultados = await this.dashboardRepository.buscarDistribuicaoPorEtapa(
			where,
			include,
			["TrabalhoConclusao.etapa"],
			[["etapa", "ASC"]],
		);

		const distribuicao = resultados.map((r) => {
			const etapa = r.etapa === null ? 0 : parseInt(String(r.etapa), 10);
			return {
				etapa,
				etapa_label: rotuloEtapa(etapa, fase ? parseInt(fase, 10) : undefined),
				quantidade: parseInt(String(r.quantidade), 10),
			};
		});

		return {
			ano: anoAlvo,
			semestre: semestreAlvo,
			fase: fase ? parseInt(fase, 10) : undefined,
			id_curso: id_curso ? parseInt(id_curso, 10) : undefined,
			codigo_docente: codigo_docente ? String(codigo_docente) : undefined,
			distribuicao,
		};
	}

	async calcularConvitesPorPeriodo(filtros: FiltrosDashboardDto) {
		const { id_curso, fase, codigo_docente } = filtros;
		const { ano: anoAlvo, semestre: semestreAlvo } = await this.resolverOfertaAlvo(filtros.ano, filtros.semestre);

		const periodo = await this.dashboardRepository.buscarPeriodoSemestre(anoAlvo, semestreAlvo);

		if (!periodo) {
			return {
				ano: anoAlvo,
				semestre: semestreAlvo,
				fase: fase ? parseInt(fase, 10) : undefined,
				id_curso: id_curso ? parseInt(id_curso, 10) : undefined,
				inicio: null,
				fim: null,
				pontos: [],
			};
		}

		const inicioPeriodo = new Date(periodo.inicio as string);
		const fimPeriodo = new Date(periodo.fim as string);

		const where: Record<string, unknown> = {
			data_envio: { [Op.between]: [inicioPeriodo, fimPeriodo] },
			...(codigo_docente ? { codigo_docente: String(codigo_docente) } : {}),
		};

		const include = [
			{
				model: TrabalhoConclusaoEntity,
				required: true,
				attributes: [],
				where: {
					ano: anoAlvo,
					semestre: semestreAlvo,
					...(fase ? { fase: parseInt(fase, 10) } : {}),
					...(id_curso ? { id_curso: parseInt(id_curso, 10) } : {}),
				},
			},
		];

		const convites = await this.dashboardRepository.buscarConvitesPorPeriodo(where, include);

		const pontosMap = new Map<string, { data: string; orientacao: number; banca: number }>();
		for (
			const d = new Date(inicioPeriodo.getFullYear(), inicioPeriodo.getMonth(), inicioPeriodo.getDate());
			d <= fimPeriodo;
			d.setDate(d.getDate() + 1)
		) {
			const chave = d.toISOString().slice(0, 10);
			pontosMap.set(chave, { data: chave, orientacao: 0, banca: 0 });
		}

		for (const c of convites) {
			const data = new Date(c.data_envio as string);
			const chave = data.toISOString().slice(0, 10);
			const existente = pontosMap.get(chave);
			if (existente) {
				if (c.orientacao) existente.orientacao += 1;
				else existente.banca += 1;
			}
		}

		return {
			ano: anoAlvo,
			semestre: semestreAlvo,
			fase: fase ? parseInt(fase, 10) : undefined,
			id_curso: id_curso ? parseInt(id_curso, 10) : undefined,
			codigo_docente: codigo_docente ? String(codigo_docente) : undefined,
			inicio: inicioPeriodo,
			fim: fimPeriodo,
			pontos: Array.from(pontosMap.values()),
		};
	}

	private async calcularConvitesStatus(filtros: FiltrosDashboardDto, orientacao: boolean) {
		const { id_curso, fase, codigo_docente } = filtros;
		const { ano: anoAlvo, semestre: semestreAlvo } = await this.resolverOfertaAlvo(filtros.ano, filtros.semestre);

		const where: Record<string, unknown> = {
			orientacao,
			...(codigo_docente ? { codigo_docente: String(codigo_docente) } : {}),
		};

		const include = [
			{
				model: TrabalhoConclusaoEntity,
				required: true,
				attributes: [],
				where: {
					ano: anoAlvo,
					semestre: semestreAlvo,
					...(fase ? { fase: parseInt(fase, 10) } : {}),
					...(id_curso ? { id_curso: parseInt(id_curso, 10) } : {}),
				},
			},
		];

		const diasPendencia = filtros.dias_pendencia ? parseInt(filtros.dias_pendencia, 10) : 5;
		const limitePendencia = new Date(Date.now() - diasPendencia * 24 * 60 * 60 * 1000);

		const resultado = orientacao
			? await this.dashboardRepository.buscarConvitesOrientacaoStatus(where, include, limitePendencia)
			: await this.dashboardRepository.buscarConvitesBancaStatus(where, include, limitePendencia);

		const linha = resultado?.[0] || {};
		const respondidos = parseInt(String(linha.respondidos || 0), 10);
		const pendentes = parseInt(String(linha.pendentes || 0), 10);
		const pendentesAntigos = parseInt(String(linha.pendentes_antigos || 0), 10);
		const total = parseInt(String(linha.total || 0), 10);

		return {
			ano: anoAlvo,
			semestre: semestreAlvo,
			fase: fase ? parseInt(fase, 10) : undefined,
			id_curso: id_curso ? parseInt(id_curso, 10) : undefined,
			codigo_docente: codigo_docente ? String(codigo_docente) : undefined,
			respondidos,
			pendentes,
			pendentes_antigos: pendentesAntigos,
			dias_pendencia: diasPendencia,
			total,
		};
	}

	calcularConvitesOrientacaoStatus(filtros: FiltrosDashboardDto) {
		return this.calcularConvitesStatus(filtros, true);
	}

	calcularConvitesBancaStatus(filtros: FiltrosDashboardDto) {
		return this.calcularConvitesStatus(filtros, false);
	}

	private async listarDocentesDisponiveis(idCurso?: string) {
		const whereOrientadorCurso: Record<string, number> = {};
		if (idCurso) whereOrientadorCurso.id_curso = parseInt(idCurso, 10);

		const includeOrientadorCurso = [{ model: DocenteEntity, as: "docente", attributes: ["codigo", "nome", "siape"] }];

		const orientadoresCurso = await this.dashboardRepository.buscarOrientadoresCurso(
			whereOrientadorCurso,
			includeOrientadorCurso,
		);

		const docentesMap = new Map<string, { codigo_docente: string; nome: string; quantidade: number }>();
		for (const oc of orientadoresCurso) {
			const docente = oc.docente as { codigo?: string; nome?: string } | undefined;
			const codigo = (oc.codigo_docente as string) || docente?.codigo;
			const nome = docente?.nome || "";
			if (!codigo) continue;
			if (!docentesMap.has(codigo)) {
				docentesMap.set(codigo, { codigo_docente: codigo, nome, quantidade: 0 });
			}
		}

		return docentesMap;
	}

	async calcularOrientandosPorDocente(filtros: FiltrosDashboardDto) {
		const { id_curso, fase } = filtros;
		const { ano: anoAlvo, semestre: semestreAlvo } = await this.resolverOfertaAlvo(filtros.ano, filtros.semestre);

		const tccWhere: Record<string, number> = { ano: anoAlvo, semestre: semestreAlvo };
		if (fase) tccWhere.fase = parseInt(fase, 10);
		if (id_curso) tccWhere.id_curso = parseInt(id_curso, 10);

		const docentesMap = await this.listarDocentesDisponiveis(id_curso);

		if (docentesMap.size === 0 && !id_curso) {
			return { ano: anoAlvo, semestre: semestreAlvo, fase: fase ? parseInt(fase, 10) : undefined, id_curso: undefined, itens: [] };
		}

		const includeOrientacao = [{ model: TrabalhoConclusaoEntity, required: true, attributes: [], where: tccWhere }];

		const contagens = await this.dashboardRepository.contarOrientandosPorDocente(
			{ orientador: true },
			includeOrientacao,
			["codigo_docente"],
		);

		for (const c of contagens) {
			const codigo = c.codigo_docente as string;
			const qtd = parseInt(String(c.quantidade || 0), 10);
			if (docentesMap.size > 0) {
				const existente = docentesMap.get(codigo);
				if (existente) existente.quantidade = qtd;
			} else {
				docentesMap.set(codigo, { codigo_docente: codigo, nome: codigo, quantidade: qtd });
			}
		}

		const itens = Array.from(docentesMap.values()).sort((a, b) => {
			if (b.quantidade !== a.quantidade) return b.quantidade - a.quantidade;
			return String(a.nome).localeCompare(String(b.nome));
		});

		return {
			ano: anoAlvo,
			semestre: semestreAlvo,
			fase: fase ? parseInt(fase, 10) : undefined,
			id_curso: id_curso ? parseInt(id_curso, 10) : undefined,
			itens,
		};
	}

	async calcularDefesasAceitasPorDocente(filtros: FiltrosDashboardDto) {
		const { id_curso, fase } = filtros;
		const { ano: anoAlvo, semestre: semestreAlvo } = await this.resolverOfertaAlvo(filtros.ano, filtros.semestre);

		const tccWhere: Record<string, number> = { ano: anoAlvo, semestre: semestreAlvo };
		if (id_curso) tccWhere.id_curso = parseInt(id_curso, 10);

		const docentesMap = await this.listarDocentesDisponiveis(id_curso);

		if (docentesMap.size === 0 && !id_curso) {
			return { ano: anoAlvo, semestre: semestreAlvo, fase: fase ? parseInt(fase, 10) : undefined, id_curso: undefined, itens: [] };
		}

		const conviteWhere: Record<string, unknown> = { aceito: true, orientacao: false };
		if (fase) conviteWhere.fase = parseInt(fase, 10);

		const includeConvite = [{ model: TrabalhoConclusaoEntity, required: true, attributes: [], where: tccWhere }];

		const contagens = await this.dashboardRepository.contarDefesasAceitasPorDocente(conviteWhere, includeConvite, [
			"codigo_docente",
		]);

		for (const c of contagens) {
			const codigo = c.codigo_docente as string;
			const qtd = parseInt(String(c.quantidade || 0), 10);
			if (docentesMap.size > 0) {
				const existente = docentesMap.get(codigo);
				if (existente) existente.quantidade = qtd;
			} else {
				docentesMap.set(codigo, { codigo_docente: codigo, nome: codigo, quantidade: qtd });
			}
		}

		const itens = Array.from(docentesMap.values()).sort((a, b) => {
			if (b.quantidade !== a.quantidade) return b.quantidade - a.quantidade;
			return String(a.nome).localeCompare(String(b.nome));
		});

		return {
			ano: anoAlvo,
			semestre: semestreAlvo,
			fase: fase ? parseInt(fase, 10) : undefined,
			id_curso: id_curso ? parseInt(id_curso, 10) : undefined,
			itens,
		};
	}

	/**
	 * Lista de defesas agrupadas por TCC/fase. Atende a Visão geral ("Próximas defesas",
	 * com `dias`), a página Defesas (`incluir_historico`, `status`) e o orientador (`codigo_docente`).
	 *
	 * Status derivado:
	 * - concluida: todos os membros já registraram avaliação;
	 * - aguardando_confirmacao: algum membro de banca com convite pendente ou recusado;
	 * - agendada: demais casos.
	 */
	async buscarDefesasAgendadas(filtros: FiltrosDashboardDto) {
		const { id_curso, fase, codigo_docente, status } = filtros;
		const incluirHistorico = filtros.incluir_historico === "true";

		const tccWhere: Record<string, number> = {};
		if (id_curso) tccWhere.id_curso = parseInt(id_curso, 10);

		const condicoesData: Record<string, unknown>[] = [];
		let anoAlvo: number | undefined;
		let semestreAlvo: number | undefined;

		// Usado no histórico para atribuir o período pela data da defesa: o TCC de fase 2 reaproveita
		// o ID do TCC de fase 1, então ano/semestre do TCC não identificam o período de defesas antigas.
		let periodos: { ano: number; semestre: number; inicio: Date; fim: Date }[] = [];

		if (incluirHistorico) {
			// Todos os períodos: ano/semestre passam a ser filtros opcionais e independentes,
			// aplicados sobre a data da defesa (janelas da tabela ano_semestre).
			anoAlvo = filtros.ano ? parseInt(filtros.ano, 10) : undefined;
			semestreAlvo = filtros.semestre ? parseInt(filtros.semestre, 10) : undefined;
			periodos = (await this.dashboardRepository.buscarTodosPeriodos())
				.filter((p) => p.inicio && p.fim)
				.map((p) => {
					const fim = new Date(p.fim as string);
					fim.setDate(fim.getDate() + 1);
					return { ano: Number(p.ano), semestre: Number(p.semestre), inicio: new Date(p.inicio as string), fim };
				});

			if (anoAlvo !== undefined || semestreAlvo !== undefined) {
				const janelas = periodos.filter(
					(p) => (anoAlvo === undefined || p.ano === anoAlvo) && (semestreAlvo === undefined || p.semestre === semestreAlvo),
				);
				condicoesData.push(
					janelas.length > 0
						? { [Op.or]: janelas.map((p) => ({ data_defesa: { [Op.gte]: p.inicio, [Op.lt]: p.fim } })) }
						: { data_defesa: null, id_tcc: null }, // nenhum período cadastrado: resultado vazio
				);
			} else {
				condicoesData.push({ data_defesa: { [Op.ne]: null } });
			}
		} else {
			const oferta = await this.resolverOfertaAlvo(filtros.ano, filtros.semestre);
			anoAlvo = oferta.ano;
			semestreAlvo = oferta.semestre;
			tccWhere.ano = anoAlvo;
			tccWhere.semestre = semestreAlvo;

			// Buscar o período do semestre para filtrar data_defesa dentro do intervalo correto.
			// Isso evita que defesas agendadas em datas de semestres anteriores apareçam na lista.
			const periodo = await this.dashboardRepository.buscarPeriodoSemestre(anoAlvo, semestreAlvo);
			if (periodo?.inicio && periodo?.fim) {
				// Estende o fim em 1 dia para incluir o último dia completo do semestre
				const fimPeriodo = new Date(periodo.fim as string);
				fimPeriodo.setDate(fimPeriodo.getDate() + 1);
				condicoesData.push({
					data_defesa: { [Op.gte]: new Date(periodo.inicio as string), [Op.lt]: fimPeriodo },
				});
			} else {
				// Fallback: apenas garante que a data existe
				condicoesData.push({ data_defesa: { [Op.ne]: null } });
			}
		}

		const dias = filtros.dias ? parseInt(filtros.dias, 10) : undefined;
		if (dias !== undefined && !Number.isNaN(dias)) {
			const agora = new Date();
			const limite = new Date(agora.getTime() + dias * 24 * 60 * 60 * 1000);
			condicoesData.push({ data_defesa: { [Op.gte]: agora, [Op.lte]: limite } });
		}

		const defesaWhere: Record<string | symbol, unknown> = { [Op.and]: condicoesData };
		if (fase) defesaWhere.fase = parseInt(fase, 10);

		// Nota: o filtro por codigo_docente é realizado em memória após o agrupamento,
		// verificando se o docente participa como orientador OU como membro de banca.
		// Isso garante que membros de banca que não são orientadores também vejam as defesas.

		const include = [
			{
				model: TrabalhoConclusaoEntity,
				required: true,
				attributes: ["id", "ano", "semestre", "id_curso", "fase", "titulo", "matricula"],
				where: tccWhere,
				include: [{ model: DicenteEntity, attributes: ["matricula", "nome"] }],
			},
			{ model: DocenteEntity, as: "membroBanca", attributes: ["codigo", "nome", "externo"] },
		];

		const defesas = await this.dashboardRepository.buscarDefesasAgendadas(defesaWhere as never, include);

		type Confirmacao = "confirmado" | "pendente" | "recusado";
		interface MembroDefesa {
			codigo: string;
			nome: string;
			papel: "orientador" | "banca";
			externo: boolean;
			confirmacao: Confirmacao;
			avaliacao: number | null;
		}
		interface ItemAgendado {
			id_tcc: number;
			data: string;
			hora: string;
			data_hora: string;
			fase: number;
			fase_label: string;
			fase_descricao: string;
			ano: number;
			semestre: number;
			id_curso: number;
			estudante: string;
			matricula: string;
			titulo: string;
			local: string | null;
			orientador: string;
			banca: string[];
			membros: MembroDefesa[];
			status: "agendada" | "aguardando_confirmacao" | "concluida";
			nota_media: number | null;
			papel_docente?: "orientador" | "avaliador";
		}

		const grupos = new Map<string, ItemAgendado>();

		for (const d of defesas as unknown as Record<string, any>[]) {
			const idTcc = d.id_tcc;
			const dataHora = new Date(d.data_defesa);
			if (Number.isNaN(dataHora.getTime())) continue;
			const dataISO = dataHora.toISOString();
			const faseNum = parseInt(String(d.fase || d.trabalhoConclusao?.fase || 0), 10) || 0;
			const chave = `${idTcc}|${faseNum}|${dataISO}`;

			if (!grupos.has(chave)) {
				const tcc = d.trabalhoConclusao || {};
				const periodoDaDefesa = periodos.find((p) => dataHora >= p.inicio && dataHora < p.fim);
				grupos.set(chave, {
					id_tcc: idTcc,
					data: dataISO.slice(0, 10),
					hora: dataISO.slice(11, 16),
					data_hora: dataISO,
					fase: faseNum,
					fase_label: String(faseNum) === "1" ? "Projeto" : "TCC",
					fase_descricao: rotuloFase(faseNum),
					ano: periodoDaDefesa?.ano ?? tcc.ano,
					semestre: periodoDaDefesa?.semestre ?? tcc.semestre,
					id_curso: tcc.id_curso,
					estudante: tcc.dicente?.nome || "",
					matricula: String(tcc.dicente?.matricula || tcc.matricula || ""),
					titulo: tcc.titulo || "",
					local: null,
					orientador: "",
					banca: [],
					membros: [],
					status: "agendada",
					nota_media: null,
				});
			}

			const item = grupos.get(chave)!;
			const codigoMembro = d.membroBanca?.codigo || String(d.membro_banca || "");
			const nomeDocente = d.membroBanca?.nome || "";
			if (d.orientador) item.orientador = nomeDocente;
			else if (nomeDocente) item.banca.push(nomeDocente);
			if (!item.local && d.local) item.local = d.local;

			item.membros.push({
				codigo: codigoMembro,
				nome: nomeDocente || codigoMembro,
				papel: d.orientador ? "orientador" : "banca",
				externo: Boolean(d.membroBanca?.externo),
				confirmacao: "confirmado",
				avaliacao: d.avaliacao === null || d.avaliacao === undefined ? null : Number(d.avaliacao),
			});
		}

		let itens = Array.from(grupos.values());

		// Confirmação de cada membro de banca a partir do convite mais recente (TCC, fase, docente).
		// Membro sem convite (ex.: incluído diretamente pelo orientador) conta como confirmado.
		const convites = await this.dashboardRepository.buscarConvitesBancaPorTccs([
			...new Set(itens.map((i) => i.id_tcc)),
		]);
		const convitePorMembro = new Map<string, Record<string, unknown>>();
		for (const c of convites) {
			const chave = `${c.id_tcc}|${c.fase}|${c.codigo_docente}`;
			const existente = convitePorMembro.get(chave);
			if (!existente || new Date(c.data_envio as string) > new Date(existente.data_envio as string)) {
				convitePorMembro.set(chave, c);
			}
		}

		for (const item of itens) {
			for (const membro of item.membros) {
				if (membro.papel !== "banca") continue;
				const convite = convitePorMembro.get(`${item.id_tcc}|${item.fase}|${membro.codigo}`);
				if (!convite) continue;
				if (convite.data_feedback === null || convite.data_feedback === undefined) membro.confirmacao = "pendente";
				else membro.confirmacao = convite.aceito ? "confirmado" : "recusado";
			}

			const notas = item.membros.map((m) => m.avaliacao).filter((n): n is number => n !== null);
			item.nota_media = notas.length ? Math.round((notas.reduce((a, b) => a + b, 0) / notas.length) * 10) / 10 : null;

			if (item.membros.length > 0 && notas.length === item.membros.length) item.status = "concluida";
			else if (item.membros.some((m) => m.confirmacao !== "confirmado")) item.status = "aguardando_confirmacao";
			else item.status = "agendada";

			if (codigo_docente) {
				const participacao = item.membros.find((m) => m.codigo === String(codigo_docente));
				if (participacao) item.papel_docente = participacao.papel === "orientador" ? "orientador" : "avaliador";
			}
		}

		// Filtrar apenas defesas em que o docente participa (orientador ou membro de banca)
		// Quando codigo_docente não é informado (admin/coordenador), retorna todas
		if (codigo_docente) itens = itens.filter((item) => item.papel_docente !== undefined);
		if (status) itens = itens.filter((item) => item.status === status);

		itens = itens.sort((a, b) => {
			if (a.data !== b.data) return a.data.localeCompare(b.data);
			if (a.hora !== b.hora) return a.hora.localeCompare(b.hora);
			return String(a.estudante).localeCompare(String(b.estudante), "pt", { sensitivity: "base" });
		});

		return {
			ano: anoAlvo,
			semestre: semestreAlvo,
			fase: fase ? parseInt(fase, 10) : undefined,
			id_curso: id_curso ? parseInt(id_curso, 10) : undefined,
			codigo_docente: codigo_docente ? String(codigo_docente) : undefined,
			dias,
			incluir_historico: incluirHistorico,
			total: itens.length,
			itens,
		};
	}

	async calcularEstudantesSemConviteBanca(filtros: FiltrosDashboardDto) {
		const { id_curso, fase, codigo_docente } = filtros;
		const { ano: anoAlvo, semestre: semestreAlvo } = await this.resolverOfertaAlvo(filtros.ano, filtros.semestre);

		const tccWhere: Record<string, number> = { ano: anoAlvo, semestre: semestreAlvo };
		if (fase) tccWhere.fase = parseInt(fase, 10);
		if (id_curso) tccWhere.id_curso = parseInt(id_curso, 10);

		const conviteBancaIncludeTcc = [{ model: TrabalhoConclusaoEntity, required: true, attributes: [], where: tccWhere }];

		const tccsComConvite = await this.dashboardRepository.buscarIdsTccsComConviteBanca(
			{ orientacao: false },
			conviteBancaIncludeTcc,
		);

		const idsTccsComConvite = [...new Set(tccsComConvite.map((c) => c.id_tcc))];

		const tccFinalWhere: Record<string, unknown> = {
			...tccWhere,
			...(idsTccsComConvite.length > 0 ? { id: { [Op.notIn]: idsTccsComConvite } } : {}),
		};

		const include: unknown[] = [
			{ model: DicenteEntity, attributes: ["matricula", "nome"] },
			{ model: CursoEntity, attributes: ["id", "nome"] },
		];

		if (codigo_docente) {
			include.push({
				model: OrientacaoEntity,
				required: true,
				attributes: [],
				where: { codigo_docente: String(codigo_docente), orientador: true },
			});
		}

		const tccs = await this.dashboardRepository.buscarEstudantesSemConviteBanca(tccFinalWhere, include as never);

		const itens = tccs.map((tcc) => {
			const t = tcc.toJSON() as unknown as {
				id: number;
				matricula: string;
				id_curso: number;
				fase: number;
				dicente?: { matricula: string; nome: string };
				curso?: { nome: string };
			};
			return {
				id_tcc: t.id,
				matricula: String(t.dicente?.matricula || t.matricula || ""),
				nome: t.dicente?.nome || "",
				id_curso: t.id_curso,
				nomeCurso: t.curso?.nome || "",
				fase: t.fase,
				faseLabel: String(t.fase) === "1" ? "Projeto" : "TCC",
			};
		});

		itens.sort((a, b) => String(a.nome).localeCompare(String(b.nome), "pt"));

		return {
			ano: anoAlvo,
			semestre: semestreAlvo,
			fase: fase ? parseInt(fase, 10) : undefined,
			id_curso: id_curso ? parseInt(id_curso, 10) : undefined,
			codigo_docente: codigo_docente ? String(codigo_docente) : undefined,
			total: itens.length,
			itens,
		};
	}

	async calcularDocentesSemDisponibilidadeBanca(filtros: FiltrosDashboardDto) {
		const { id_curso, fase } = filtros;
		const { ano: anoAlvo, semestre: semestreAlvo } = await this.resolverOfertaAlvo(filtros.ano, filtros.semestre);

		const tccWhere: Record<string, number> = { ano: anoAlvo, semestre: semestreAlvo };
		if (fase) tccWhere.fase = parseInt(fase, 10);
		if (id_curso) tccWhere.id_curso = parseInt(id_curso, 10);

		const conviteIncludeTcc = [{ model: TrabalhoConclusaoEntity, required: true, attributes: [], where: tccWhere }];

		const docentesComConvite = await this.dashboardRepository.buscarCodigosDocentesComConviteBanca(
			{ orientacao: false },
			conviteIncludeTcc,
		);

		const codigosComConvite = new Set(docentesComConvite.map((d) => d.codigo_docente));

		if (codigosComConvite.size === 0) {
			return { ano: anoAlvo, semestre: semestreAlvo, fase: fase ? parseInt(fase, 10) : undefined, id_curso: id_curso ? parseInt(id_curso, 10) : undefined, total: 0, itens: [] };
		}

		const dispWhere: Record<string, number> = { ano: anoAlvo, semestre: semestreAlvo };
		if (id_curso) dispWhere.id_curso = parseInt(id_curso, 10);
		if (fase) dispWhere.fase = parseInt(fase, 10);

		const docentesComDisp = await this.dashboardRepository.buscarCodigosDocentesComDisponibilidade(dispWhere);
		const codigosComDisp = new Set(docentesComDisp.map((d) => d.codigo_docente));

		const codigosSemDisp = [...codigosComConvite].filter((c) => !codigosComDisp.has(c));

		if (codigosSemDisp.length === 0) {
			return { ano: anoAlvo, semestre: semestreAlvo, fase: fase ? parseInt(fase, 10) : undefined, id_curso: id_curso ? parseInt(id_curso, 10) : undefined, total: 0, itens: [] };
		}

		const bancaWhere: Record<string, unknown> = { codigo_docente: { [Op.in]: codigosSemDisp } };
		if (id_curso) bancaWhere.id_curso = parseInt(id_curso, 10);

		const includeDocente = [{ model: DocenteEntity, as: "docente", attributes: ["codigo", "nome"] }];

		const docentesBanca = await this.dashboardRepository.buscarDocentesBancaCurso(bancaWhere, includeDocente);

		const docentesMap = new Map<string, { codigo_docente: string; nome: string }>();
		for (const bc of docentesBanca as unknown as { codigo_docente: string; docente?: { nome?: string } }[]) {
			const codigo = bc.codigo_docente;
			if (!codigo) continue;
			if (!docentesMap.has(codigo)) {
				docentesMap.set(codigo, { codigo_docente: codigo, nome: bc.docente?.nome || codigo });
			}
		}

		for (const codigo of codigosSemDisp) {
			if (!docentesMap.has(codigo)) {
				docentesMap.set(codigo, { codigo_docente: codigo, nome: codigo });
			}
		}

		const itens = Array.from(docentesMap.values()).sort((a, b) => String(a.nome).localeCompare(String(b.nome), "pt"));

		return {
			ano: anoAlvo,
			semestre: semestreAlvo,
			fase: fase ? parseInt(fase, 10) : undefined,
			id_curso: id_curso ? parseInt(id_curso, 10) : undefined,
			total: itens.length,
			itens,
		};
	}
}
