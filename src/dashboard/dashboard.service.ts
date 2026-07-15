import { Injectable } from "@nestjs/common";
import { Op } from "sequelize";
import { AnoSemestreService } from "../ano-semestre/ano-semestre.service";
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

		const total = await this.dashboardRepository.contarTccsNaOferta(tccWhere);
		const comOrientador = await this.dashboardRepository.contarTccsComOrientador(tccWhere, [
			{ model: OrientacaoEntity, required: true, where: { orientador: true } },
		]);

		return {
			ano: anoAlvo,
			semestre: semestreAlvo,
			fase: fase ? parseInt(fase, 10) : undefined,
			id_curso: id_curso ? parseInt(id_curso, 10) : undefined,
			total,
			comOrientador,
		};
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

		const distribuicao = resultados.map((r) => ({
			etapa: r.etapa === null ? 0 : parseInt(String(r.etapa), 10),
			quantidade: parseInt(String(r.quantidade), 10),
		}));

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

		const resultado = orientacao
			? await this.dashboardRepository.buscarConvitesOrientacaoStatus(where, include)
			: await this.dashboardRepository.buscarConvitesBancaStatus(where, include);

		const linha = resultado?.[0] || {};
		const respondidos = parseInt(String(linha.respondidos || 0), 10);
		const pendentes = parseInt(String(linha.pendentes || 0), 10);
		const total = parseInt(String(linha.total || 0), 10);

		return {
			ano: anoAlvo,
			semestre: semestreAlvo,
			fase: fase ? parseInt(fase, 10) : undefined,
			id_curso: id_curso ? parseInt(id_curso, 10) : undefined,
			codigo_docente: codigo_docente ? String(codigo_docente) : undefined,
			respondidos,
			pendentes,
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

	async buscarDefesasAgendadas(filtros: FiltrosDashboardDto) {
		const { id_curso, fase, codigo_docente } = filtros;
		const { ano: anoAlvo, semestre: semestreAlvo } = await this.resolverOfertaAlvo(filtros.ano, filtros.semestre);

		const tccWhere: Record<string, number> = { ano: anoAlvo, semestre: semestreAlvo };
		if (id_curso) tccWhere.id_curso = parseInt(id_curso, 10);

		const defesaWhere: Record<string, unknown> = { data_defesa: { [Op.ne]: null } };
		if (fase) defesaWhere.fase = parseInt(fase, 10);
		if (codigo_docente) defesaWhere.membro_banca = String(codigo_docente);

		const include = [
			{
				model: TrabalhoConclusaoEntity,
				required: true,
				attributes: ["id", "ano", "semestre", "id_curso", "fase", "titulo", "matricula"],
				where: tccWhere,
				include: [{ model: DicenteEntity, attributes: ["matricula", "nome"] }],
			},
			{ model: DocenteEntity, as: "membroBanca", attributes: ["codigo", "nome"] },
		];

		const defesas = await this.dashboardRepository.buscarDefesasAgendadas(defesaWhere, include);

		interface ItemAgendado {
			id_tcc: number;
			data: string;
			hora: string;
			fase: number;
			fase_label: string;
			estudante: string;
			titulo: string;
			orientador: string;
			banca: string[];
		}

		const grupos = new Map<string, ItemAgendado>();
		for (const d of defesas as unknown as Record<string, any>[]) {
			const idTcc = d.id_tcc;
			const dataHora = new Date(d.data_defesa);
			if (Number.isNaN(dataHora.getTime())) continue;
			const dataISO = dataHora.toISOString();
			const chave = `${idTcc}|${dataISO}`;

			const nomeEstudante = d.trabalhoConclusao?.dicente?.nome || "";
			const titulo = d.trabalhoConclusao?.titulo || "";
			const faseNum = parseInt(String(d.fase || d.trabalhoConclusao?.fase || 0), 10) || 0;
			const faseLabel = String(faseNum) === "1" ? "Projeto" : "TCC";

			if (!grupos.has(chave)) {
				grupos.set(chave, {
					id_tcc: idTcc,
					data: dataISO.slice(0, 10),
					hora: dataISO.slice(11, 16),
					fase: faseNum,
					fase_label: faseLabel,
					estudante: nomeEstudante,
					titulo,
					orientador: "",
					banca: [],
				});
			}

			const item = grupos.get(chave)!;
			const nomeDocente = d.membroBanca?.nome || d.membro_banca || "";
			if (d.orientador) item.orientador = nomeDocente;
			else if (nomeDocente) item.banca.push(nomeDocente);
		}

		const itens = Array.from(grupos.values()).sort((a, b) => {
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
