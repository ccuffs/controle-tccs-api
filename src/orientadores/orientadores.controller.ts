import { Body, Controller, Delete, Get, HttpCode, HttpException, Param, Post, UseGuards } from "@nestjs/common";
import { RequerPermissao } from "../common/decorators/permissoes.decorator";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { PermissoesGuard } from "../common/guards/permissoes.guard";
import { Permissoes } from "../permissoes/permissoes.enum";
import { CriarOrientadorDto } from "./dto/criar-orientador.dto";
import { OrientadoresService } from "./orientadores.service";

/** Porta de src/resources/orientadores-resource.js + src/services/orientadores-service.js. */
@Controller("orientadores")
@UseGuards(JwtAuthGuard, PermissoesGuard)
export class OrientadoresController {
	constructor(private readonly orientadoresService: OrientadoresService) {}

	@Get()
	@RequerPermissao(
		Permissoes.ORIENTACAO.VISUALIZAR,
		Permissoes.ORIENTACAO.VISUALIZAR_TODAS,
		Permissoes.TRABALHO_CONCLUSAO.VISUALIZAR,
		Permissoes.TRABALHO_CONCLUSAO.VISUALIZAR_TODOS,
	)
	async retornaTodasOrientacoes() {
		const orientacoes = await this.orientadoresService.obterTodasOrientacoes();
		return { orientacoes };
	}

	@Get("docente/:codigo")
	@RequerPermissao(Permissoes.ORIENTACAO.VISUALIZAR, Permissoes.ORIENTACAO.VISUALIZAR_TODAS)
	async retornaOrientacoesPorDocente(@Param("codigo") codigo: string) {
		const orientacoes = await this.orientadoresService.obterOrientacoesPorDocente(codigo);
		return { orientacoes };
	}

	@Get("curso/:id")
	@RequerPermissao(
		Permissoes.ORIENTACAO.VISUALIZAR,
		Permissoes.ORIENTACAO.VISUALIZAR_TODAS,
		Permissoes.TRABALHO_CONCLUSAO.VISUALIZAR,
		Permissoes.TRABALHO_CONCLUSAO.VISUALIZAR_TODOS,
	)
	async retornaOrientacoesPorCurso(@Param("id") id: string) {
		const orientacoes = await this.orientadoresService.obterOrientacoesPorCurso(Number(id));
		return { orientacoes };
	}

	@Post()
	@HttpCode(200)
	@RequerPermissao(Permissoes.ORIENTACAO.CRIAR)
	async criaOrientacao(@Body("formData") formData: CriarOrientadorDto) {
		await this.orientadoresService.criarOrientacao(formData);
	}

	@Delete(":id_curso/:codigo_docente")
	@HttpCode(200)
	@RequerPermissao(Permissoes.ORIENTACAO.DELETAR)
	async deletaOrientacao(@Param("id_curso") idCurso: string, @Param("codigo_docente") codigoDocente: string) {
		try {
			const sucesso = await this.orientadoresService.deletarOrientacao(Number(idCurso), codigoDocente);

			if (!sucesso) {
				throw new HttpException({ message: "Orientação não encontrada" }, 404);
			}
		} catch (error) {
			if (error instanceof HttpException) {
				throw error;
			}
			throw new HttpException({ message: "Erro ao deletar orientação" }, 500);
		}
	}
}
