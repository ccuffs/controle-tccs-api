import { HttpException, Injectable } from "@nestjs/common";
import { AnoSemestreService } from "../ano-semestre/ano-semestre.service";
import { OfertaTccEntity } from "../database/entities";
import { CriarOfertaTccDto } from "./dto/criar-oferta-tcc.dto";
import { OfertaTccChave, OfertasTccRepository } from "./ofertas-tcc.repository";

export interface FiltrosOfertaTcc {
	ano?: string;
	semestre?: string;
	id_curso?: string;
	fase?: string;
}

@Injectable()
export class OfertasTccService {
	constructor(
		private readonly ofertasTccRepository: OfertasTccRepository,
		private readonly anoSemestreService: AnoSemestreService,
	) {}

	obterTodasOfertasTcc(filtros: FiltrosOfertaTcc): Promise<OfertaTccEntity[]> {
		const { ano, semestre, id_curso, fase } = filtros;
		const whereClause: Record<string, number> = {};

		if (ano) whereClause.ano = parseInt(ano, 10);
		if (semestre) whereClause.semestre = parseInt(semestre, 10);
		if (id_curso) whereClause.id_curso = parseInt(id_curso, 10);
		if (fase) whereClause.fase = parseInt(fase, 10);

		return this.ofertasTccRepository.buscarOfertasTcc(whereClause);
	}

	obterOfertaTccPorChave(chave: OfertaTccChave): Promise<OfertaTccEntity | null> {
		return this.ofertasTccRepository.buscarOfertaTccPorChave(chave);
	}

	async criarOfertaTcc(dados: CriarOfertaTccDto): Promise<void> {
		const chave: OfertaTccChave = {
			ano: dados.ano,
			semestre: dados.semestre,
			id_curso: dados.id_curso,
			fase: dados.fase,
		};

		const ofertaExistente = await this.ofertasTccRepository.verificarOfertaExistente(chave);

		if (ofertaExistente) {
			throw new HttpException({ message: "Já existe uma oferta TCC para este período, curso e fase" }, 400);
		}

		await this.ofertasTccRepository.criarOfertaTcc(dados);
	}

	async atualizarOfertaTcc(chave: OfertaTccChave, dados: Partial<OfertaTccEntity>): Promise<boolean> {
		const updatedRowsCount = await this.ofertasTccRepository.atualizarOfertaTcc(chave, dados);
		return updatedRowsCount > 0;
	}

	async deletarOfertaTcc(chave: OfertaTccChave): Promise<void> {
		const trabalhosVinculados = await this.ofertasTccRepository.contarTrabalhosVinculados(chave);

		if (trabalhosVinculados > 0) {
			throw new HttpException(
				{
					message: `Não é possível deletar esta oferta pois existem ${trabalhosVinculados} trabalho(s) de conclusão vinculado(s)`,
				},
				400,
			);
		}

		const deleted = await this.ofertasTccRepository.deletarOfertaTcc(chave);

		if (!deleted) {
			throw new HttpException({ message: "Oferta TCC não encontrada" }, 404);
		}
	}

	async obterOfertasAtivas(): Promise<OfertaTccEntity[]> {
		const { ano: anoAtual } = await this.anoSemestreService.calcularAnoSemestreAtual();
		return this.ofertasTccRepository.buscarOfertasAtivas(anoAtual - 1);
	}

	obterUltimaOfertaTcc(): Promise<OfertaTccEntity | null> {
		return this.ofertasTccRepository.buscarUltimaOfertaTcc();
	}
}
