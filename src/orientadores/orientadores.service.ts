import { Injectable } from "@nestjs/common";
import { OrientadorCursoEntity } from "../database/entities";
import { CriarOrientadorDto } from "./dto/criar-orientador.dto";
import { OrientadoresRepository } from "./orientadores.repository";

@Injectable()
export class OrientadoresService {
	constructor(private readonly orientadoresRepository: OrientadoresRepository) {}

	obterTodasOrientacoes(): Promise<OrientadorCursoEntity[]> {
		return this.orientadoresRepository.obterTodasOrientacoes();
	}

	obterOrientacoesPorDocente(codigo: string): Promise<OrientadorCursoEntity[]> {
		return this.orientadoresRepository.obterOrientacoesPorDocente(codigo);
	}

	obterOrientacoesPorCurso(id: number): Promise<OrientadorCursoEntity[]> {
		return this.orientadoresRepository.obterOrientacoesPorCurso(id);
	}

	criarOrientacao(dados: CriarOrientadorDto): Promise<OrientadorCursoEntity> {
		return this.orientadoresRepository.criarOrientacao(dados);
	}

	deletarOrientacao(idCurso: number, codigoDocente: string): Promise<boolean> {
		return this.orientadoresRepository.deletarOrientacao(idCurso, codigoDocente);
	}
}
