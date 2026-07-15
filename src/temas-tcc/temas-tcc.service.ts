import { Injectable } from "@nestjs/common";
import { AnoSemestreService } from "../ano-semestre/ano-semestre.service";
import { DocenteOfertaEntity, TemaTccEntity } from "../database/entities";
import { OfertasTccService } from "../ofertas-tcc/ofertas-tcc.service";
import { AtualizarTemaTccDto } from "./dto/atualizar-tema-tcc.dto";
import { CriarTemaTccDto } from "./dto/criar-tema-tcc.dto";
import { TemasTccRepository } from "./temas-tcc.repository";

@Injectable()
export class TemasTccService {
	constructor(
		private readonly temasTccRepository: TemasTccRepository,
		private readonly anoSemestreService: AnoSemestreService,
		private readonly ofertasTccService: OfertasTccService,
	) {}

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

	async obterTemasTccPorCurso(idCurso: string): Promise<Record<string, unknown>[]> {
		const { ano: anoAtual, semestre: semestreAtual } = await this.anoSemestreService.calcularAnoSemestreAtual();
		const temas = await this.temasTccRepository.obterTemasTccPorCurso(idCurso);
		const faseVigente = await this.calcularFaseVigente(idCurso, anoAtual, semestreAtual);

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
				return temaData;
			}),
		);
	}

	obterTemasTccPorDocente(codigo: string): Promise<TemaTccEntity[]> {
		return this.temasTccRepository.obterTemasTccPorDocente(codigo);
	}

	async obterTemasTccPorDocenteECurso(codigo: string, idCurso: string): Promise<Record<string, unknown>[]> {
		const { ano: anoAtual, semestre: semestreAtual } = await this.anoSemestreService.calcularAnoSemestreAtual();
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

		return temas.map((tema) => {
			const temaData = tema.toJSON() as Record<string, unknown>;
			temaData.vagasOferta = vagasOferta;
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
	): Promise<DocenteOfertaEntity> {
		const { ano: anoAtual, semestre: semestreAtual } = await this.anoSemestreService.calcularAnoSemestreAtual();
		return this.temasTccRepository.criarOuAtualizarOfertaDocente(anoAtual, semestreAtual, idCurso, codigoDocente, vagas);
	}
}
