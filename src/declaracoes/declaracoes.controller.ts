import { Controller, Get, Header, Param, Query, Res, UseGuards } from "@nestjs/common";
import type { Response } from "express";
import { UsuarioAtual } from "../common/decorators/usuario-atual.decorator";
import { RequerGrupo } from "../common/decorators/grupos.decorator";
import { GruposGuard } from "../common/guards/grupos.guard";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { UsuarioEntity } from "../database/entities";
import { Permissoes } from "../permissoes/permissoes.enum";
import { DeclaracoesService } from "./declaracoes.service";

interface FiltrosQuery {
	curso?: string;
	ano?: string;
	semestre?: string;
	fase?: string;
}

function parseFiltros(query: FiltrosQuery) {
	const { curso, ano, semestre, fase } = query;
	return {
		...(curso && { id_curso: parseInt(curso, 10) }),
		...(ano && { ano: parseInt(ano, 10) }),
		...(semestre && { semestre: parseInt(semestre, 10) }),
		...(fase && { fase: parseInt(fase, 10) }),
	};
}

/** Porta de src/resources/declaracoes-resource.js + src/services/declaracoes-service.js. */
@Controller("declaracoes")
@UseGuards(JwtAuthGuard, GruposGuard)
export class DeclaracoesController {
	constructor(private readonly declaracoesService: DeclaracoesService) {}

	@Get()
	@RequerGrupo(Permissoes.GRUPOS.ORIENTADOR, Permissoes.GRUPOS.PROFESSOR_CCR, Permissoes.GRUPOS.BANCA, Permissoes.GRUPOS.ADMIN)
	async listarDeclaracoes(@UsuarioAtual() usuario: UsuarioEntity, @Query() query: FiltrosQuery) {
		return this.declaracoesService.listarDeclaracoes(usuario.id as string, parseFiltros(query));
	}

	@Get("gerar/:idTcc/:tipoParticipacao")
	@RequerGrupo(Permissoes.GRUPOS.ORIENTADOR, Permissoes.GRUPOS.PROFESSOR_CCR, Permissoes.GRUPOS.BANCA, Permissoes.GRUPOS.ADMIN)
	@Header("Content-Type", "text/html; charset=utf-8")
	async gerarDeclaracao(
		@UsuarioAtual() usuario: UsuarioEntity,
		@Param("idTcc") idTcc: string,
		@Param("tipoParticipacao") tipoParticipacao: string,
		@Res() res: Response,
	) {
		const html = await this.declaracoesService.gerarDeclaracao(usuario.id as string, Number(idTcc), tipoParticipacao);
		res.send(html);
	}

	@Get("externas")
	@RequerGrupo(Permissoes.GRUPOS.ORIENTADOR, Permissoes.GRUPOS.PROFESSOR_CCR, Permissoes.GRUPOS.ADMIN)
	async listarDeclaracoesExternas(@UsuarioAtual() usuario: UsuarioEntity, @Query() query: FiltrosQuery) {
		return this.declaracoesService.listarDeclaracoesExternas(usuario.id as string, parseFiltros(query));
	}

	@Get("gerar-externo/:idTcc/:codigoDocente")
	@RequerGrupo(Permissoes.GRUPOS.ORIENTADOR, Permissoes.GRUPOS.PROFESSOR_CCR, Permissoes.GRUPOS.ADMIN)
	@Header("Content-Type", "text/html; charset=utf-8")
	async gerarDeclaracaoExterno(
		@UsuarioAtual() usuario: UsuarioEntity,
		@Param("idTcc") idTcc: string,
		@Param("codigoDocente") codigoDocente: string,
		@Res() res: Response,
	) {
		const html = await this.declaracoesService.gerarDeclaracaoExterno(usuario.id as string, Number(idTcc), codigoDocente);
		res.send(html);
	}

	@Get("gerar-tabela/:tipoParticipacao")
	@RequerGrupo(Permissoes.GRUPOS.ORIENTADOR, Permissoes.GRUPOS.PROFESSOR_CCR, Permissoes.GRUPOS.BANCA, Permissoes.GRUPOS.ADMIN)
	@Header("Content-Type", "text/html; charset=utf-8")
	async gerarDeclaracaoTabela(
		@UsuarioAtual() usuario: UsuarioEntity,
		@Param("tipoParticipacao") tipoParticipacao: string,
		@Query() query: FiltrosQuery,
		@Res() res: Response,
	) {
		const html = await this.declaracoesService.gerarDeclaracaoTabela(
			usuario.id as string,
			tipoParticipacao,
			parseFiltros(query),
		);
		res.send(html);
	}
}
