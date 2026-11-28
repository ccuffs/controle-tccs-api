import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpException,
	HttpStatus,
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
import { PermissoesService } from "../permissoes/permissoes.service";
import { ConvitesService } from "./convites.service";
import { FiltrosConvites } from "./convites.repository";
import { CriarConviteDto } from "./dto/criar-convite.dto";

/** Porta de src/resources/convite-resource.js + src/services/convite-service.js. */
@Controller("convites")
@UseGuards(JwtAuthGuard, PermissoesGuard)
export class ConvitesController {
	constructor(
		private readonly convitesService: ConvitesService,
		private readonly permissoesService: PermissoesService,
	) {}

	@Get()
	@RequerPermissao(Permissoes.CONVITE.VISUALIZAR, Permissoes.CONVITE.VISUALIZAR_TODOS)
	async retornaTodosConvites(@Query() query: FiltrosConvites, @UsuarioAtual() usuario: UsuarioEntity) {
		const temPermissaoTotal = await this.permissoesService.usuarioTemPermissaoId(
			usuario.id as string,
			Permissoes.CONVITE.VISUALIZAR_TODOS,
		);

		if (!temPermissaoTotal) {
			// Restringe aos convites dos TCCs do próprio discente
			const matricula = await this.permissoesService.buscarMatriculaDoUsuario(usuario.id as string);
			if (query.id_tcc) {
				// Verifica se o TCC solicitado pertence ao discente
				if (!matricula) {
					throw new HttpException({ message: "Permissão negada: recurso pertence a outro usuário" }, 403);
				}
				const pertence = await this.permissoesService.verificarPropriedadeTcc(Number(query.id_tcc), matricula);
				if (!pertence) {
					throw new HttpException({ message: "Permissão negada: recurso pertence a outro usuário" }, 403);
				}
			} else if (!matricula) {
				return { convites: [] };
			}
			// Sem id_tcc: todos os TCCs do discente (filtráveis por ano/semestre do seletor do topo).
			query = { ...query, matricula: matricula as string };
		}

		const convites = await this.convitesService.obterTodosConvites(query);
		return { convites };
	}

	@Post()
	@HttpCode(HttpStatus.CREATED)
	@RequerPermissao(Permissoes.CONVITE.CRIAR)
	async criaConvite(@Body("formData") formData: CriarConviteDto, @UsuarioAtual() usuario: UsuarioEntity) {
		const temPermissaoTotal = await this.permissoesService.usuarioTemPermissaoId(
			usuario.id as string,
			Permissoes.TRABALHO_CONCLUSAO.VISUALIZAR_TODOS,
		);

		if (!temPermissaoTotal) {
			// Verifica se o TCC do convite pertence ao discente
			const matricula = await this.permissoesService.buscarMatriculaDoUsuario(usuario.id as string);
			if (!matricula) {
				throw new HttpException({ message: "Permissão negada: recurso pertence a outro usuário" }, 403);
			}
			const pertence = await this.permissoesService.verificarPropriedadeTcc(formData.id_tcc, matricula);
			if (!pertence) {
				throw new HttpException({ message: "Permissão negada: recurso pertence a outro usuário" }, 403);
			}
		}

		await this.convitesService.criarConvite(formData);
		return { message: "Convite criado com sucesso" };
	}

	/** Responder convite: apenas professores (BANCA, ORIENTADOR, PROFESSOR, PROFESSOR_CCR, ADMIN). */
	@Put(":id/:codigo_docente/:fase")
	@UseGuards(GruposGuard)
	@RequerGrupo(
		Permissoes.GRUPOS.BANCA,
		Permissoes.GRUPOS.ORIENTADOR,
		Permissoes.GRUPOS.PROFESSOR,
		Permissoes.GRUPOS.PROFESSOR_CCR,
		Permissoes.GRUPOS.ADMIN,
	)
	@RequerPermissao(Permissoes.CONVITE.EDITAR)
	async respondeConvite(
		@Param("id") id: string,
		@Param("codigo_docente") codigoDocente: string,
		@Param("fase") fase: string,
		@Body("aceito") aceito: boolean,
	) {
		await this.convitesService.responderConvite(Number(id), codigoDocente, Number(fase), aceito);
		return { message: `Convite ${aceito ? "aceito" : "rejeitado"} com sucesso` };
	}

	@Delete(":id/:codigo_docente/:fase")
	@HttpCode(200)
	@RequerPermissao(Permissoes.CONVITE.DELETAR)
	async deletaConvite(
		@Param("id") id: string,
		@Param("codigo_docente") codigoDocente: string,
		@Param("fase") fase: string,
		@UsuarioAtual() usuario: UsuarioEntity,
	) {
		const temPermissaoTotal = await this.permissoesService.usuarioTemPermissaoId(
			usuario.id as string,
			Permissoes.TRABALHO_CONCLUSAO.VISUALIZAR_TODOS,
		);

		if (!temPermissaoTotal) {
			// :id aqui é id_tcc — verifica se o TCC pertence ao discente
			const matricula = await this.permissoesService.buscarMatriculaDoUsuario(usuario.id as string);
			if (!matricula) {
				throw new HttpException({ message: "Permissão negada: recurso pertence a outro usuário" }, 403);
			}
			const pertence = await this.permissoesService.verificarPropriedadeTcc(Number(id), matricula);
			if (!pertence) {
				throw new HttpException({ message: "Permissão negada: recurso pertence a outro usuário" }, 403);
			}
		}

		const sucesso = await this.convitesService.deletarConvite(Number(id), codigoDocente, Number(fase));

		if (!sucesso) {
			throw new HttpException({ message: "Convite não encontrado" }, 404);
		}
	}

	@Get("docente/:codigo")
	@RequerPermissao(Permissoes.CONVITE.VISUALIZAR, Permissoes.CONVITE.VISUALIZAR_TODOS)
	async retornaConvitesDocente(
		@Param("codigo") codigo: string,
		@Query("ano") ano?: string,
		@Query("semestre") semestre?: string,
		@Query("desde_ano") desdeAno?: string,
		@Query("desde_semestre") desdeSemestre?: string,
	) {
		const convites = await this.convitesService.obterConvitesDocente(codigo, {
			ano,
			semestre,
			desde_ano: desdeAno,
			desde_semestre: desdeSemestre,
		});
		return { convites };
	}
}
