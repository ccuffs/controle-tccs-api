import { Injectable } from "@nestjs/common";
import { AreaTccEntity } from "../database/entities";
import { AreasTccRepository } from "./areas-tcc.repository";
import { AtualizarAreaTccDto } from "./dto/atualizar-area-tcc.dto";
import { CriarAreaTccDto } from "./dto/criar-area-tcc.dto";

@Injectable()
export class AreasTccService {
	constructor(private readonly areasTccRepository: AreasTccRepository) {}

	obterTodasAreasTcc(): Promise<AreaTccEntity[]> {
		return this.areasTccRepository.obterTodasAreasTcc();
	}

	obterAreasTccPorDocente(codigo: string): Promise<AreaTccEntity[]> {
		return this.areasTccRepository.obterAreasTccPorDocente(codigo);
	}

	criarAreaTcc(dados: CriarAreaTccDto): Promise<AreaTccEntity> {
		return this.areasTccRepository.criarAreaTcc(dados);
	}

	atualizarAreaTcc(dados: AtualizarAreaTccDto): Promise<boolean> {
		return this.areasTccRepository.atualizarAreaTcc(dados.id, dados);
	}

	deletarAreaTcc(id: number): Promise<boolean> {
		return this.areasTccRepository.deletarAreaTcc(id);
	}
}
