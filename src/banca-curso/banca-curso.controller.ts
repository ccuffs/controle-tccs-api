import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { RequerPermissao } from "../common/decorators/permissoes.decorator";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { PermissoesGuard } from "../common/guards/permissoes.guard";
import { Permissoes } from "../permissoes/permissoes.enum";
import { BancaCursoService } from "./banca-curso.service";

/** Porta de src/resources/banca-curso-resource.js + src/services/banca-curso-service.js. */
@Controller("banca-curso")
@UseGuards(JwtAuthGuard, PermissoesGuard)
export class BancaCursoController {
	constructor(private readonly bancaCursoService: BancaCursoService) {}

	@Get("curso/:id")
	@RequerPermissao(
		Permissoes.ORIENTACAO.VISUALIZAR,
		Permissoes.ORIENTACAO.VISUALIZAR_TODAS,
		Permissoes.TRABALHO_CONCLUSAO.VISUALIZAR,
		Permissoes.TRABALHO_CONCLUSAO.VISUALIZAR_TODOS,
	)
	async retornaDocentesBancaPorCurso(@Param("id") id: string) {
		const docentesBanca = await this.bancaCursoService.obterDocentesBancaPorCurso(Number(id));
		return { docentesBanca };
	}

	@Get("docente/:codigo")
	@RequerPermissao(Permissoes.ORIENTACAO.VISUALIZAR, Permissoes.ORIENTACAO.VISUALIZAR_TODAS)
	async retornaCursosPorDocenteBanca(@Param("codigo") codigo: string) {
		const cursos = await this.bancaCursoService.obterCursosPorDocenteBanca(codigo);
		return { cursos };
	}

	@Get("verificar/:idCurso/:codigoDocente")
	@RequerPermissao(Permissoes.ORIENTACAO.VISUALIZAR, Permissoes.ORIENTACAO.VISUALIZAR_TODAS)
	async verificarDocenteBanca(@Param("idCurso") idCurso: string, @Param("codigoDocente") codigoDocente: string) {
		const podeParticipar = await this.bancaCursoService.verificarDocenteBanca(Number(idCurso), codigoDocente);
		return { podeParticipar };
	}
}
