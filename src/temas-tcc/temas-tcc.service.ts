import { Injectable } from "@nestjs/common";
import { AnoSemestreService } from "../ano-semestre/ano-semestre.service";
import { DocenteOfertaEntity, TemaTccEntity } from "../database/entities";
import { OfertasTccService } from "../ofertas-tcc/ofertas-tcc.service";
import { AtualizarTemaTccDto } from "./dto/atualizar-tema-tcc.dto";
import { CriarTemaTccDto } from "./dto/criar-tema-tcc.dto";
import { TemasTccRepository } from "./temas-tcc.repository";

/** Período das vagas (docente_oferta); os temas em si não têm período. */
export interface PeriodoTemas {
	ano: number;
	semestre: number;
}

/** Converte ?ano&semestre (ou campos do corpo) num período; exige os dois, senão vale o atual. */
export function periodoTemas(ano?: string | number, semestre?: string | number): PeriodoTemas | undefined {
	const a = Number(ano);
	const s = Number(semestre);
	return Number.isInteger(a) && a > 0 && (s === 1 || s === 2) ? { ano: a, semestre: s } : undefined;
}

@Injectable()
export class TemasTccService {
	constructor(
		private readonly temasTccRepository: TemasTccRepository,
		private readonly anoSemestreService: AnoSemestreService,
		private readonly ofertasTccService: OfertasTccService,
	) {}

	/** Período informado pelo seletor do front ou, sem ele, o período atual. */
	private async resolverPeriodo(periodo?: PeriodoTemas): Promise<{ ano: number; semestre: number }> {
		return periodo ?? this.anoSemestreService.calcularAnoSemestreAtual();
	}

	obterTodosTemasTcc(): Promise<TemaTccEntity[]> {
		return this.temasTccRepository.obterTodosTemasTcc();
	}

	private async calcularFaseVigente(idCurso: string, anoAtual: number, semestreAtual: number): Promise<number> {
		try {
			const ultimaOferta = await this.ofertasTccService.obterUltimaOfertaTcc();
			if (
				ultimaOferta &&
				Number(ultimaOferta.id_curso) === parseInt(idCurso, 10) &&
				ultimaOferta.ano === anoAtual &&
				ultimaOferta.semestre === semestreAtual
			) {
				return Number(ultimaOferta.fase) || 1;
			}
		} catch {
			// mantém faseVigente = 1 em caso de erro, igual ao legado
		}
		return 1;
	}

	async obterTemasTccPorCurso(idCurso: string, periodo?: PeriodoTemas): Promise<Record<string, unknown>[]> {
		const { ano: anoAtual, semestre: semestreAtual } = await this.resolverPeriodo(periodo);
		const temas = await this.temasTccRepository.obterTemasTccPorCurso(idCurso);
		const faseVigente = await this.calcularFaseVigente(idCurso, anoAtual, semestreAtual);

		// vagasOcupadas: orientandos do docente na oferta vigente (as vagas são do docente, não do tema).
		const ocupadasPorDocente = new Map<string, Promise<number>>();
		const ocupadas = (codigo: string) => {
			if (!ocupadasPorDocente.has(codigo)) {
				ocupadasPorDocente.set(
					codigo,
					this.temasTccRepository.contarOrientandosNaOferta(codigo, idCurso, anoAtual, semestreAtual, faseVigente),
				);
			}
			return ocupadasPorDocente.get(codigo) as Promise<number>;
		};

		return Promise.all(
			temas.map(async (tema) => {
				const temaData = tema.toJSON() as Record<string, unknown> & { docente: { codigo: string } };
				const docenteOferta = await this.temasTccRepository.buscarOfertaDocente(
					anoAtual,
					semestreAtual,
					idCurso,
					temaData.docente.codigo,
					faseVigente,
				);
				temaData.vagasOferta = docenteOferta ? docenteOferta.vagas : 0;
				temaData.vagasOcupadas = await ocupadas(temaData.docente.codigo);
				return temaData;
			}),
		);
	}

	obterTemasTccPorDocente(codigo: string): Promise<TemaTccEntity[]> {
		return this.temasTccRepository.obterTemasTccPorDocente(codigo);
	}

	async obterTemasTccPorDocenteECurso(
		codigo: string,
		idCurso: string,
		periodo?: PeriodoTemas,
	): Promise<Record<string, unknown>[]> {
		const { ano: anoAtual, semestre: semestreAtual } = await this.resolverPeriodo(periodo);
		const temas = await this.temasTccRepository.obterTemasTccPorDocenteECurso(codigo, idCurso);
		const faseVigente = await this.calcularFaseVigente(idCurso, anoAtual, semestreAtual);

		const docenteOferta = await this.temasTccRepository.buscarOfertaDocente(
			anoAtual,
			semestreAtual,
			idCurso,
			codigo,
			faseVigente,
		);
		const vagasOferta = docenteOferta ? docenteOferta.vagas : 0;
		const vagasOcupadas = await this.temasTccRepository.contarOrientandosNaOferta(
			codigo,
			idCurso,
			anoAtual,
			semestreAtual,
			faseVigente,
		);

		return temas.map((tema) => {
			const temaData = tema.toJSON() as Record<string, unknown>;
			temaData.vagasOferta = vagasOferta;
			temaData.vagasOcupadas = vagasOcupadas;
			return temaData;
		});
	}

	criarTemaTcc(dados: CriarTemaTccDto): Promise<TemaTccEntity> {
		return this.temasTccRepository.criarTemaTcc(dados);
	}

	atualizarTemaTcc(dados: AtualizarTemaTccDto): Promise<boolean> {
		return this.temasTccRepository.atualizarTemaTcc(dados.id, dados);
	}

	atualizarVagasTemaTcc(id: number, vagas: number): Promise<boolean> {
		return this.temasTccRepository.atualizarVagasTemaTcc(id, vagas);
	}

	deletarTemaTcc(id: number): Promise<boolean> {
		return this.temasTccRepository.deletarTemaTcc(id);
	}

	async atualizarVagasOfertaDocente(
		codigoDocente: string,
		idCurso: string,
		vagas: number,
		periodo?: PeriodoTemas,
	): Promise<DocenteOfertaEntity> {
		const { ano: anoAtual, semestre: semestreAtual } = await this.resolverPeriodo(periodo);
		return this.temasTccRepository.criarOuAtualizarOfertaDocente(anoAtual, semestreAtual, idCurso, codigoDocente, vagas);
	}
}
