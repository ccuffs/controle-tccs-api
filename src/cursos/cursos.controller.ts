import { Body, Controller, Delete, Get, HttpCode, HttpException, Param, Post, Put, UseGuards } from "@nestjs/common";
import { RequerPermissao } from "../common/decorators/permissoes.decorator";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { PermissoesGuard } from "../common/guards/permissoes.guard";
import { Permissoes } from "../permissoes/permissoes.enum";
import { AtualizarCursoDto } from "./dto/atualizar-curso.dto";
import { CriarCursoDto } from "./dto/criar-curso.dto";
import { CursosService } from "./cursos.service";

/** Porta de src/resources/cursos-resource.js + src/services/curso-service.js. */
@Controller("cursos")
@UseGuards(JwtAuthGuard, PermissoesGuard)
export class CursosController {
	constructor(private readonly cursosService: CursosService) {}

	@Get()
	@RequerPermissao(Permissoes.CURSO.VISUALIZAR, Permissoes.CURSO.VISUALIZAR_TODOS)
	async retornaTodosCursos() {
		const cursos = await this.cursosService.obterTodosCursos();
		return { cursos };
	}

	@Post()
	@HttpCode(200)
	@RequerPermissao(Permissoes.CURSO.CRIAR)
	async criaCurso(@Body("formData") formData: CriarCursoDto) {
		await this.cursosService.criarCurso(formData);
	}

	@Put()
	@HttpCode(200)
	@RequerPermissao(Permissoes.CURSO.EDITAR)
	async atualizaCurso(@Body("formData") formData: AtualizarCursoDto) {
		const sucesso = await this.cursosService.atualizarCurso(formData);

		if (!sucesso) {
			throw new HttpException({ message: "Curso não encontrado" }, 404);
		}
	}

	@Delete(":id")
	@HttpCode(200)
	@RequerPermissao(Permissoes.CURSO.DELETAR)
	async deletaCurso(@Param("id") id: string) {
		try {
			const sucesso = await this.cursosService.deletarCurso(Number(id));

			if (!sucesso) {
				throw new HttpException({ message: "Curso não encontrado" }, 404);
			}
		} catch (error) {
			if (error instanceof HttpException) {
				throw error;
			}
			throw new HttpException({ message: "Erro ao deletar curso" }, 500);
		}
	}
}
