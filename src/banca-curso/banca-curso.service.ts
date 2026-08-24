import { Injectable } from "@nestjs/common";
import { BancaCursoEntity } from "../database/entities";
import { BancaCursoRepository } from "./banca-curso.repository";

@Injectable()
export class BancaCursoService {
	constructor(private readonly bancaCursoRepository: BancaCursoRepository) {}

	obterDocentesBancaPorCurso(id: number): Promise<BancaCursoEntity[]> {
		return this.bancaCursoRepository.obterDocentesBancaPorCurso(id);
	}

	obterCursosPorDocenteBanca(codigo: string): Promise<BancaCursoEntity[]> {
		return this.bancaCursoRepository.obterCursosPorDocenteBanca(codigo);
	}

	verificarDocenteBanca(idCurso: number, codigoDocente: string): Promise<boolean> {
		return this.bancaCursoRepository.verificarDocenteBanca(idCurso, codigoDocente);
	}
}
