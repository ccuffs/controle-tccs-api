import { Injectable } from "@nestjs/common";
import { DatasDefesaTccEntity } from "../database/entities";
import { AtualizarDataDefesaDto } from "./dto/atualizar-data-defesa.dto";
import { CriarDataDefesaDto } from "./dto/criar-data-defesa.dto";
import { DatasDefesaRepository, FiltrosDatasDefesa } from "./datas-defesa.repository";

@Injectable()
export class DatasDefesaService {
	constructor(private readonly datasDefesaRepository: DatasDefesaRepository) {}

	obterTodasDatasDefesa(filtros: FiltrosDatasDefesa): Promise<DatasDefesaTccEntity[]> {
		return this.datasDefesaRepository.obterTodasDatasDefesa(filtros);
	}

	obterDatasDefesaPorOferta(ano: string, semestre: string, idCurso: string, fase: string): Promise<DatasDefesaTccEntity | null> {
		return this.datasDefesaRepository.obterDatasDefesaPorOferta(ano, semestre, idCurso, fase);
	}

	criarDataDefesa(dados: CriarDataDefesaDto): Promise<DatasDefesaTccEntity> {
		return this.datasDefesaRepository.criarDataDefesa(dados);
	}

	atualizarDataDefesa(
		ano: string,
		semestre: string,
		idCurso: string,
		fase: string,
		dados: AtualizarDataDefesaDto,
	): Promise<boolean> {
		return this.datasDefesaRepository.atualizarDataDefesa(ano, semestre, idCurso, fase, dados);
	}

	deletarDataDefesa(ano: string, semestre: string, idCurso: string, fase: string): Promise<boolean> {
		return this.datasDefesaRepository.deletarDataDefesa(ano, semestre, idCurso, fase);
	}
}
