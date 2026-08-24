import { Injectable } from "@nestjs/common";
import { TrabalhoConclusaoEntity } from "../database/entities";
import { OfertasTccService } from "../ofertas-tcc/ofertas-tcc.service";
import { AtualizarTrabalhoConclusaoDto } from "./dto/atualizar-trabalho-conclusao.dto";
import { CriarTrabalhoConclusaoDto } from "./dto/criar-trabalho-conclusao.dto";
import { FiltrosTrabalhoConclusao, TrabalhoConclusaoRepository } from "./trabalho-conclusao.repository";

@Injectable()
export class TrabalhoConclusaoService {
	constructor(
		private readonly trabalhoConclusaoRepository: TrabalhoConclusaoRepository,
		private readonly ofertasTccService: OfertasTccService,
	) {}

	obterTodosTrabalhosConclusao(filtros: FiltrosTrabalhoConclusao): Promise<TrabalhoConclusaoEntity[]> {
		return this.trabalhoConclusaoRepository.obterTodosTrabalhosConclusao(filtros);
	}

	obterTrabalhoConclusaoPorId(id: number): Promise<TrabalhoConclusaoEntity | null> {
		return this.trabalhoConclusaoRepository.obterTrabalhoConclusaoPorId(id);
	}

	buscarPorDiscente(matricula: string): Promise<TrabalhoConclusaoEntity | null> {
		return this.trabalhoConclusaoRepository.buscarPorDiscente(matricula);
	}

	/** Porta de `buscarTrabalhoPorDiscenteOfertaAtual` (trabalho-conclusao-service.js). */
	async buscarPorDiscenteOfertaAtual(matricula: string): Promise<TrabalhoConclusaoEntity | null> {
		const ultimaOferta = await this.ofertasTccService.obterUltimaOfertaTcc();

		if (!ultimaOferta) {
			throw new Error("Nenhuma oferta TCC encontrada no sistema");
		}

		return this.trabalhoConclusaoRepository.buscarPorDiscenteEOferta(
			matricula,
			ultimaOferta.ano,
			ultimaOferta.semestre,
			ultimaOferta.id_curso,
			ultimaOferta.fase,
		);
	}

	async criarTrabalhoConclusao(dados: CriarTrabalhoConclusaoDto): Promise<TrabalhoConclusaoEntity> {
		return this.trabalhoConclusaoRepository.criarTrabalhoConclusao(dados);
	}

	async atualizarTrabalhoConclusao(
		id: number,
		dados: AtualizarTrabalhoConclusaoDto,
	): Promise<TrabalhoConclusaoEntity | null> {
		const sucesso = await this.trabalhoConclusaoRepository.atualizarTrabalhoConclusao(id, dados);
		if (!sucesso) {
			return null;
		}
		return this.trabalhoConclusaoRepository.obterTrabalhoConclusaoPorId(id);
	}

	deletarTrabalhoConclusao(id: number): Promise<boolean> {
		return this.trabalhoConclusaoRepository.deletarTrabalhoConclusao(id);
	}
}
