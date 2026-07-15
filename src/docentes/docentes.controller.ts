import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpException,
	Param,
	Post,
	Put,
	Query,
	UseGuards,
} from "@nestjs/common";
import { UsuarioAtual } from "../common/decorators/usuario-atual.decorator";
import { RequerGrupo } from "../common/decorators/grupos.decorator";
import { RequerPermissao } from "../common/decorators/permissoes.decorator";
import { GruposGuard } from "../common/guards/grupos.guard";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { PermissoesGuard } from "../common/guards/permissoes.guard";
import { UsuarioEntity } from "../database/entities";
import { Permissoes } from "../permissoes/permissoes.enum";
import { AtualizarDocenteDto } from "./dto/atualizar-docente.dto";
import { CriarDocenteDto } from "./dto/criar-docente.dto";
import { DocentesService } from "./docentes.service";

/** Porta de src/resources/docentes-resource.js + src/services/docentes-service.js. */
@Controller("docentes")
export class DocentesController {
	constructor(private readonly docentesService: DocentesService) {}

	@Get()
	@UseGuards(JwtAuthGuard, PermissoesGuard)
	@RequerPermissao(Permissoes.DOCENTE.VISUALIZAR, Permissoes.DOCENTE.VISUALIZAR_TODOS)
	async retornaTodosDocentes() {
		const docentes = await this.docentesService.obterTodosDocentes();
		return { docentes };
	}

	@Post()
	@HttpCode(200)
	@UseGuards(JwtAuthGuard, PermissoesGuard)
	@RequerPermissao(Permissoes.DOCENTE.CRIAR)
	async criaDocente(@Body("formData") formData: CriarDocenteDto) {
		await this.docentesService.criarDocente(formData);
	}

	@Put()
	@HttpCode(200)
	@UseGuards(JwtAuthGuard)
	async atualizaDocente(@UsuarioAtual() usuario: UsuarioEntity, @Body("formData") formData: AtualizarDocenteDto) {
		const sucesso = await this.docentesService.atualizarDocente(usuario.id as string, formData);

		if (!sucesso) {
			throw new HttpException({ message: "Docente não encontrado" }, 404);
		}
	}

	@Delete(":codigo")
	@HttpCode(200)
	@UseGuards(JwtAuthGuard, PermissoesGuard)
	@RequerPermissao(Permissoes.DOCENTE.DELETAR)
	async deletaDocente(@Param("codigo") codigo: string) {
		try {
			const sucesso = await this.docentesService.deletarDocente(codigo);

			if (!sucesso) {
				throw new HttpException({ message: "Docente não encontrado" }, 404);
			}
		} catch (error) {
			if (error instanceof HttpException) {
				throw error;
			}
			throw new HttpException({ message: "Erro ao deletar docente" }, 500);
		}
	}

	@Get("meu-perfil")
	@UseGuards(JwtAuthGuard)
	async retornaDocentePorUsuario(@UsuarioAtual() usuario: UsuarioEntity) {
		const docente = await this.docentesService.obterDocentePorUsuario(usuario.id as string);

		if (!docente) {
			throw new HttpException({ message: "Docente não encontrado" }, 404);
		}

		return { docente };
	}

	@Get("buscar-externo")
	@UseGuards(JwtAuthGuard, GruposGuard)
	@RequerGrupo(Permissoes.GRUPOS.ORIENTADOR, Permissoes.GRUPOS.PROFESSOR_CCR, Permissoes.GRUPOS.ADMIN)
	async buscarExternosPorNome(@Query("nome") nome: string | undefined) {
		if (!nome || nome.trim().length < 2) {
			return { docentes: [] };
		}

		try {
			const docentes = await this.docentesService.buscarExternosPorNome(nome.trim());
			return { docentes };
		} catch {
			throw new HttpException({ message: "Erro ao buscar docentes" }, 500);
		}
	}
}
