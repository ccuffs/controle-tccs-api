import { Injectable } from "@nestjs/common";
import { CursoEntity } from "../database/entities";
import { AtualizarCursoDto } from "./dto/atualizar-curso.dto";
import { CriarCursoDto } from "./dto/criar-curso.dto";
import { CursosRepository } from "./cursos.repository";

@Injectable()
export class CursosService {
	constructor(private readonly cursosRepository: CursosRepository) {}

	obterTodosCursos(): Promise<CursoEntity[]> {
		return this.cursosRepository.obterTodosCursos();
	}

	criarCurso(dados: CriarCursoDto): Promise<CursoEntity> {
		return this.cursosRepository.criarCurso(dados);
	}

	atualizarCurso(dados: AtualizarCursoDto): Promise<boolean> {
		return this.cursosRepository.atualizarCurso(dados.id, dados);
	}

	deletarCurso(id: number): Promise<boolean> {
		return this.cursosRepository.deletarCurso(id);
	}
}
