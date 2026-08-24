import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpException,
	HttpStatus,
	Param,
	Patch,
	Post,
	Put,
	UseGuards,
} from "@nestjs/common";
import { RequerPermissao } from "../common/decorators/permissoes.decorator";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { PermissoesGuard } from "../common/guards/permissoes.guard";
import { Permissoes } from "../permissoes/permissoes.enum";
import { AtualizarTemaTccDto } from "./dto/atualizar-tema-tcc.dto";
import { CriarTemaTccDto } from "./dto/criar-tema-tcc.dto";
import { TemasTccService } from "./temas-tcc.service";

/** Porta de src/resources/tema-tcc-resource.js + src/services/tema-tcc-service.js.
 * Respostas não usam envelope (arrays/objetos crus), igual ao legado. */
@Controller("temas-tcc")
@UseGuards(JwtAuthGuard, PermissoesGuard)
export class TemasTccController {
	constructor(private readonly temasTccService: TemasTccService) {}

	@Get()
	@RequerPermissao(Permissoes.TEMA_TCC.VISUALIZAR, Permissoes.TEMA_TCC.VISUALIZAR_TODOS)
	async retornaTodosTemasTcc() {
		return this.temasTccService.obterTodosTemasTcc();
	}

	@Get("curso/:id_curso")
	@RequerPermissao(Permissoes.TEMA_TCC.VISUALIZAR, Permissoes.TEMA_TCC.VISUALIZAR_TODOS)
	async retornaTemasTccPorCurso(@Param("id_curso") idCurso: string) {
		return this.temasTccService.obterTemasTccPorCurso(idCurso);
	}

	@Get("docente/:codigo")
	@RequerPermissao(Permissoes.TEMA_TCC.VISUALIZAR, Permissoes.TEMA_TCC.VISUALIZAR_TODOS)
	async retornaTemasTccPorDocente(@Param("codigo") codigo: string) {
		return this.temasTccService.obterTemasTccPorDocente(codigo);
	}

	@Get("docente/:codigo/curso/:id_curso")
	@RequerPermissao(Permissoes.TEMA_TCC.VISUALIZAR, Permissoes.TEMA_TCC.VISUALIZAR_TODOS)
	async retornaTemasTccPorDocenteECurso(@Param("codigo") codigo: string, @Param("id_curso") idCurso: string) {
		return this.temasTccService.obterTemasTccPorDocenteECurso(codigo, idCurso);
	}

	@Post()
	@HttpCode(HttpStatus.CREATED)
	@RequerPermissao(Permissoes.TEMA_TCC.CRIAR)
	async criaTemaTcc(@Body() formData: CriarTemaTccDto) {
		return this.temasTccService.criarTemaTcc(formData);
	}

	@Put()
	@RequerPermissao(Permissoes.TEMA_TCC.EDITAR)
	async atualizaTemaTcc(@Body() formData: AtualizarTemaTccDto) {
		const sucesso = await this.temasTccService.atualizarTemaTcc(formData);

		if (!sucesso) {
			throw new HttpException({ error: "Tema TCC não encontrado" }, 404);
		}

		return { message: "Atualizado com sucesso!" };
	}

	@Patch(":id/vagas")
	@RequerPermissao(Permissoes.TEMA_TCC.EDITAR)
	async atualizaVagasTemaTcc(@Param("id") id: string, @Body("vagas") vagas: number) {
		const sucesso = await this.temasTccService.atualizarVagasTemaTcc(Number(id), vagas);

		if (!sucesso) {
			throw new HttpException({ error: "Tema TCC não encontrado" }, 404);
		}

		return { message: "Vagas atualizadas com sucesso!" };
	}

	@Patch("docente/:codigo_docente/curso/:id_curso/vagas")
	@RequerPermissao(Permissoes.TEMA_TCC.EDITAR)
	async atualizaVagasOfertaDocente(
		@Param("codigo_docente") codigoDocente: string,
		@Param("id_curso") idCurso: string,
		@Body("vagas") vagas: number,
	) {
		const docenteOferta = await this.temasTccService.atualizarVagasOfertaDocente(codigoDocente, idCurso, vagas);
		return { message: "Vagas da oferta atualizadas com sucesso", docenteOferta };
	}

	@Delete(":id")
	@RequerPermissao(Permissoes.TEMA_TCC.DELETAR)
	async deletaTemaTcc(@Param("id") id: string) {
		const sucesso = await this.temasTccService.deletarTemaTcc(Number(id));

		if (!sucesso) {
			throw new HttpException({ error: "Tema TCC não encontrado" }, 404);
		}

		return { message: "Tema TCC deletado com sucesso!" };
	}
}
