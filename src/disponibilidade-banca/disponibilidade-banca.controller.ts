import { Body, Controller, Delete, Get, HttpCode, HttpException, HttpStatus, Param, Post, Put, Query, UseGuards } from "@nestjs/common";
import { RequerPermissao } from "../common/decorators/permissoes.decorator";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { PermissoesGuard } from "../common/guards/permissoes.guard";
import { Permissoes } from "../permissoes/permissoes.enum";
import { CriarDisponibilidadeDto } from "./dto/criar-disponibilidade.dto";
import { DisponibilidadeBancaService } from "./disponibilidade-banca.service";
import { FiltrosDisponibilidade } from "./disponibilidade-banca.repository";

/** Porta de src/resources/disponibilidade-banca-resource.js + src/services/disponibilidade-banca-service.js. */
@Controller("disponibilidade-banca")
@UseGuards(JwtAuthGuard, PermissoesGuard)
export class DisponibilidadeBancaController {
	constructor(private readonly disponibilidadeBancaService: DisponibilidadeBancaService) {}

	@Get()
	@RequerPermissao(Permissoes.DISPONIBILIDADE_BANCA.VISUALIZAR, Permissoes.DISPONIBILIDADE_BANCA.VISUALIZAR_TODOS)
	async retornaTodasDisponibilidades(@Query() query: FiltrosDisponibilidade) {
		const disponibilidades = await this.disponibilidadeBancaService.obterTodasDisponibilidades(query);
		return { disponibilidades };
	}

	@Get(":ano/:semestre/:id_curso/:fase/:codigo_docente/:data_defesa/:hora_defesa")
	@RequerPermissao(Permissoes.DISPONIBILIDADE_BANCA.VISUALIZAR, Permissoes.DISPONIBILIDADE_BANCA.VISUALIZAR_TODOS)
	async retornaDisponibilidade(
		@Param("ano") ano: string,
		@Param("semestre") semestre: string,
		@Param("id_curso") idCurso: string,
		@Param("fase") fase: string,
		@Param("codigo_docente") codigoDocente: string,
		@Param("data_defesa") dataDefesa: string,
		@Param("hora_defesa") horaDefesa: string,
	) {
		const disponibilidade = await this.disponibilidadeBancaService.obterDisponibilidade(
			ano,
			semestre,
			idCurso,
			fase,
			codigoDocente,
			dataDefesa,
			horaDefesa,
		);
		return { disponibilidade };
	}

	@Get("docente/:codigo_docente/:ano/:semestre/:id_curso/:fase")
	@RequerPermissao(Permissoes.DISPONIBILIDADE_BANCA.VISUALIZAR, Permissoes.DISPONIBILIDADE_BANCA.VISUALIZAR_TODOS)
	async retornaDisponibilidadesPorDocenteEOferta(
		@Param("codigo_docente") codigoDocente: string,
		@Param("ano") ano: string,
		@Param("semestre") semestre: string,
		@Param("id_curso") idCurso: string,
		@Param("fase") fase: string,
	) {
		const disponibilidades = await this.disponibilidadeBancaService.obterDisponibilidadesPorDocenteEOferta(
			codigoDocente,
			ano,
			semestre,
			idCurso,
			fase,
		);
		return { disponibilidades };
	}

	@Get("grade/:codigo_docente/:ano/:semestre/:id_curso/:fase")
	@RequerPermissao(Permissoes.DISPONIBILIDADE_BANCA.VISUALIZAR, Permissoes.DISPONIBILIDADE_BANCA.VISUALIZAR_TODOS)
	async retornaGradeDisponibilidade(
		@Param("codigo_docente") codigoDocente: string,
		@Param("ano") ano: string,
		@Param("semestre") semestre: string,
		@Param("id_curso") idCurso: string,
		@Param("fase") fase: string,
	) {
		const grade = await this.disponibilidadeBancaService.obterGradeDisponibilidade(codigoDocente, ano, semestre, idCurso, fase);
		return { grade };
	}

	@Post()
	@HttpCode(HttpStatus.CREATED)
	@RequerPermissao(Permissoes.DISPONIBILIDADE_BANCA.CRIAR, Permissoes.DISPONIBILIDADE_BANCA.EDITAR)
	async criaDisponibilidade(@Body() dadosDisponibilidade: CriarDisponibilidadeDto) {
		try {
			const disponibilidade = await this.disponibilidadeBancaService.criarDisponibilidade(dadosDisponibilidade);
			return { disponibilidade };
		} catch (error) {
			if (error instanceof HttpException) {
				throw error;
			}
			throw new HttpException({ message: "Erro ao criar disponibilidade" }, 500);
		}
	}

	@Post("upsert")
	@RequerPermissao(Permissoes.DISPONIBILIDADE_BANCA.CRIAR, Permissoes.DISPONIBILIDADE_BANCA.EDITAR)
	async criaOuAtualizaDisponibilidade(@Body() dadosDisponibilidade: CriarDisponibilidadeDto) {
		try {
			const disponibilidade = await this.disponibilidadeBancaService.criaOuAtualizaDisponibilidade(dadosDisponibilidade);
			return { disponibilidade };
		} catch (error) {
			if (error instanceof HttpException) {
				throw error;
			}
			throw new HttpException({ message: "Erro ao criar/atualizar disponibilidade" }, 500);
		}
	}

	@Post("sincronizar")
	@RequerPermissao(Permissoes.DISPONIBILIDADE_BANCA.CRIAR, Permissoes.DISPONIBILIDADE_BANCA.EDITAR)
	async sincronizarDisponibilidades(@Body("disponibilidades") disponibilidades: unknown) {
		try {
			return await this.disponibilidadeBancaService.sincronizarDisponibilidades(
				disponibilidades as Parameters<DisponibilidadeBancaService["sincronizarDisponibilidades"]>[0],
			);
		} catch (error) {
			if (error instanceof HttpException) {
				throw error;
			}
			throw new HttpException({ message: "Erro ao sincronizar disponibilidades" }, 500);
		}
	}

	@Put(":ano/:semestre/:id_curso/:fase/:codigo_docente/:data_defesa/:hora_defesa")
	@RequerPermissao(Permissoes.DISPONIBILIDADE_BANCA.EDITAR)
	async atualizaDisponibilidade(
		@Param("ano") ano: string,
		@Param("semestre") semestre: string,
		@Param("id_curso") idCurso: string,
		@Param("fase") fase: string,
		@Param("codigo_docente") codigoDocente: string,
		@Param("data_defesa") dataDefesa: string,
		@Param("hora_defesa") horaDefesa: string,
		@Body() body: Record<string, unknown>,
	) {
		try {
			const { disponivel: _disponivel, ...dadosDisponibilidade } = body;
			const atualizada = await this.disponibilidadeBancaService.atualizarDisponibilidade(
				ano,
				semestre,
				idCurso,
				fase,
				codigoDocente,
				dataDefesa,
				horaDefesa,
				dadosDisponibilidade,
			);

			if (!atualizada) {
				throw new HttpException({ message: "Disponibilidade não encontrada" }, 404);
			}

			return { message: "Disponibilidade atualizada com sucesso" };
		} catch (error) {
			if (error instanceof HttpException) {
				throw error;
			}
			throw new HttpException({ message: "Erro ao atualizar disponibilidade" }, 500);
		}
	}

	@Delete(":ano/:semestre/:id_curso/:fase/:codigo_docente/:data_defesa/:hora_defesa")
	@RequerPermissao(Permissoes.DISPONIBILIDADE_BANCA.DELETAR)
	async deletaDisponibilidade(
		@Param("ano") ano: string,
		@Param("semestre") semestre: string,
		@Param("id_curso") idCurso: string,
		@Param("fase") fase: string,
		@Param("codigo_docente") codigoDocente: string,
		@Param("data_defesa") dataDefesa: string,
		@Param("hora_defesa") horaDefesa: string,
	) {
		const deleted = await this.disponibilidadeBancaService.deletarDisponibilidade(
			ano,
			semestre,
			idCurso,
			fase,
			codigoDocente,
			dataDefesa,
			horaDefesa,
		);

		if (!deleted) {
			throw new HttpException({ message: "Disponibilidade não encontrada" }, 404);
		}

		return { message: "Disponibilidade deletada com sucesso" };
	}
}
