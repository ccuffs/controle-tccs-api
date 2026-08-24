import {
	Body,
	Controller,
	Delete,
	Get,
	Header,
	HttpCode,
	HttpException,
	HttpStatus,
	Param,
	Post,
	Put,
	Query,
	Res,
	UseGuards,
} from "@nestjs/common";
import type { Response } from "express";
import { UsuarioAtual } from "../common/decorators/usuario-atual.decorator";
import { RequerGrupo } from "../common/decorators/grupos.decorator";
import { RequerPermissao } from "../common/decorators/permissoes.decorator";
import { GruposGuard } from "../common/guards/grupos.guard";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { PermissoesGuard } from "../common/guards/permissoes.guard";
import { UsuarioEntity } from "../database/entities";
import { Permissoes } from "../permissoes/permissoes.enum";
import { AdicionarMembroExternoDto } from "./dto/membro-externo.dto";
import { AgendarDefesaDto } from "./dto/agendar-defesa.dto";
import { AtualizarDefesaDto } from "./dto/atualizar-defesa.dto";
import { CriarDefesaDto } from "./dto/criar-defesa.dto";
import { GerenciarBancaDto } from "./dto/gerenciar-banca.dto";
import { DefesasService } from "./defesas.service";
import { FiltrosDefesas } from "./defesas.repository";

/** Porta de src/resources/defesa-resource.js + src/services/defesa-service.js. */
@Controller("defesas")
@UseGuards(JwtAuthGuard, PermissoesGuard)
export class DefesasController {
	constructor(private readonly defesasService: DefesasService) {}

	@Get()
	@RequerPermissao(Permissoes.TRABALHO_CONCLUSAO.VISUALIZAR, Permissoes.TRABALHO_CONCLUSAO.VISUALIZAR_TODOS)
	async retornaTodasDefesas(@Query() query: FiltrosDefesas) {
		const defesas = await this.defesasService.obterTodasDefesas(query);
		return { defesas };
	}

	@Get("tcc/:id_tcc")
	@RequerPermissao(Permissoes.TRABALHO_CONCLUSAO.VISUALIZAR, Permissoes.TRABALHO_CONCLUSAO.VISUALIZAR_TODOS)
	async retornaDefesasPorTcc(@Param("id_tcc") idTcc: string) {
		const defesas = await this.defesasService.obterDefesasPorTcc(Number(idTcc));
		return { defesas: defesas || [] };
	}

	@Post("agendar")
	@HttpCode(HttpStatus.CREATED)
	@RequerPermissao(Permissoes.TRABALHO_CONCLUSAO.CRIAR)
	async agendarDefesa(@Body() dados: AgendarDefesaDto) {
		const resultado = await this.defesasService.agendarDefesa(dados);
		return {
			message: "Defesa agendada com sucesso",
			horarioAnteriorRemovido: resultado.horarioAnteriorRemovido,
			horarioPosteriorRemovido: resultado.horarioPosteriorRemovido,
		};
	}

	@Post()
	@HttpCode(HttpStatus.CREATED)
	@RequerPermissao(Permissoes.TRABALHO_CONCLUSAO.CRIAR)
	async criaDefesa(@Body("formData") formData: CriarDefesaDto) {
		await this.defesasService.criarDefesa(formData);
		return { message: "Defesa criada com sucesso" };
	}

	@Post("gerenciar-banca")
	@RequerPermissao(Permissoes.TRABALHO_CONCLUSAO.CRIAR, Permissoes.TRABALHO_CONCLUSAO.EDITAR)
	async gerenciarBancaDefesa(@Body() dados: GerenciarBancaDto) {
		const resultado = await this.defesasService.gerenciarBancaDefesa(dados);
		return {
			message: "Banca de defesa gerenciada com sucesso",
			membros_adicionados: resultado.membros_adicionados,
			membros_removidos: resultado.membros_removidos,
			orientador_incluido: resultado.orientador_incluido,
			data_defesa_atualizada: resultado.data_defesa_atualizada,
		};
	}

	@Put("avaliacao/:id_tcc")
	@RequerPermissao(Permissoes.TRABALHO_CONCLUSAO.EDITAR)
	async registraAvaliacaoDefesa(@Param("id_tcc") idTcc: string, @Body("avaliacao") avaliacao: number) {
		const sucesso = await this.defesasService.registrarAvaliacaoDefesa(Number(idTcc), avaliacao);

		if (!sucesso) {
			throw new HttpException({ message: "Defesa não encontrada" }, 404);
		}

		return { message: "Avaliação registrada com sucesso" };
	}

	@Put(":id_tcc/:membro_banca")
	@RequerPermissao(Permissoes.TRABALHO_CONCLUSAO.EDITAR)
	async atualizaDefesa(
		@Param("id_tcc") idTcc: string,
		@Param("membro_banca") membroBanca: string,
		@Body("formData") formData: AtualizarDefesaDto,
	) {
		const sucesso = await this.defesasService.atualizarDefesa(Number(idTcc), membroBanca, formData);

		if (!sucesso) {
			throw new HttpException({ message: "Defesa não encontrada" }, 404);
		}

		return { message: "Defesa atualizada com sucesso" };
	}

	@Delete(":id_tcc/:membro_banca/:fase")
	@RequerPermissao(Permissoes.TRABALHO_CONCLUSAO.DELETAR)
	async deletaDefesa(@Param("id_tcc") idTcc: string, @Param("membro_banca") membroBanca: string, @Param("fase") fase: string) {
		const resultado = await this.defesasService.deletarDefesa(Number(idTcc), membroBanca, Number(fase));

		if (!resultado.sucesso) {
			throw new HttpException({ message: resultado.motivo }, 404);
		}

		return { message: "Defesa deletada com sucesso", disponibilidadesRestauradas: resultado.disponibilidadesRestauradas };
	}

	@Post("membro-externo")
	@HttpCode(HttpStatus.CREATED)
	@UseGuards(GruposGuard)
	@RequerGrupo(Permissoes.GRUPOS.ORIENTADOR, Permissoes.GRUPOS.PROFESSOR_CCR, Permissoes.GRUPOS.ADMIN)
	async adicionarMembroExterno(@UsuarioAtual() usuario: UsuarioEntity, @Body() dados: AdicionarMembroExternoDto) {
		const resultado = await this.defesasService.adicionarMembroExterno(usuario.id as string, dados);
		return { message: "Membro externo adicionado à banca com sucesso", codigo_docente: resultado.codigo_docente };
	}

	@Get("ata/:id_tcc/:fase")
	@RequerPermissao(Permissoes.TRABALHO_CONCLUSAO.VISUALIZAR, Permissoes.TRABALHO_CONCLUSAO.VISUALIZAR_TODOS)
	@Header("Content-Type", "text/html; charset=utf-8")
	async gerarAtaDefesa(
		@Param("id_tcc") idTcc: string,
		@Param("fase") fase: string,
		@Query("local") local: string | undefined,
		@Res() res: Response,
	) {
		const html = await this.defesasService.gerarAtaDefesa(Number(idTcc), Number(fase), local || "");
		res.send(html);
	}

	@Get("externos/tcc/:id_tcc")
	@RequerPermissao(Permissoes.TRABALHO_CONCLUSAO.VISUALIZAR, Permissoes.TRABALHO_CONCLUSAO.VISUALIZAR_TODOS)
	async listarMembrosExternosTcc(@Param("id_tcc") idTcc: string) {
		const membros = await this.defesasService.listarMembrosExternosTcc(Number(idTcc));
		return { membros };
	}

	@Delete("externo/:id_tcc/:codigo_docente/:fase")
	@UseGuards(GruposGuard)
	@RequerGrupo(Permissoes.GRUPOS.ORIENTADOR, Permissoes.GRUPOS.PROFESSOR_CCR, Permissoes.GRUPOS.ADMIN)
	async removerMembroExterno(
		@UsuarioAtual() usuario: UsuarioEntity,
		@Param("id_tcc") idTcc: string,
		@Param("codigo_docente") codigoDocente: string,
		@Param("fase") fase: string,
	) {
		await this.defesasService.removerMembroExterno(usuario.id as string, Number(idTcc), codigoDocente, Number(fase));
		return { message: "Membro externo removido da banca com sucesso" };
	}
}
