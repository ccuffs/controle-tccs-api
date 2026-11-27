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
import { RequerPermissao } from "../common/decorators/permissoes.decorator";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { PermissoesGuard } from "../common/guards/permissoes.guard";
import { UsuarioEntity } from "../database/entities";
import { Permissoes } from "../permissoes/permissoes.enum";
import { PermissoesService } from "../permissoes/permissoes.service";
import { AtualizarTrabalhoConclusaoDto } from "./dto/atualizar-trabalho-conclusao.dto";
import { CriarTrabalhoConclusaoDto } from "./dto/criar-trabalho-conclusao.dto";
import { FiltrosTrabalhoConclusao } from "./trabalho-conclusao.repository";
import { TrabalhoConclusaoService } from "./trabalho-conclusao.service";

/** Porta de src/resources/trabalho-conclusao-resource.js + src/services/trabalho-conclusao-service.js. */
@Controller("trabalho-conclusao")
@UseGuards(JwtAuthGuard, PermissoesGuard)
export class TrabalhoConclusaoController {
	constructor(
		private readonly trabalhoConclusaoService: TrabalhoConclusaoService,
		private readonly permissoesService: PermissoesService,
	) {}

	/** Retorna a matrícula do usuário autenticado; lança 403 se não for discente. */
	private async exigirMatricula(userId: string): Promise<string> {
		const matricula = await this.permissoesService.buscarMatriculaDoUsuario(userId);
		if (!matricula) {
			throw new HttpException({ message: "Permissão negada: recurso pertence a outro usuário" }, 403);
		}
		return matricula;
	}

	@Get()
	@RequerPermissao(Permissoes.TRABALHO_CONCLUSAO.VISUALIZAR, Permissoes.TRABALHO_CONCLUSAO.VISUALIZAR_TODOS)
	async retornaTodosTrabalhosConlusao(
		@Query() query: FiltrosTrabalhoConclusao,
		@UsuarioAtual() usuario: UsuarioEntity,
	) {
		const temPermissaoTotal = await this.permissoesService.usuarioTemPermissaoId(
			usuario.id as string,
			Permissoes.TRABALHO_CONCLUSAO.VISUALIZAR_TODOS,
		);

		if (!temPermissaoTotal) {
			// Restringe ao próprio TCC do discente
			const matricula = await this.exigirMatricula(usuario.id as string);
			query = { ...query, matricula };
		}

		const trabalhos = await this.trabalhoConclusaoService.obterTodosTrabalhosConclusao(query);
		return { trabalhos };
	}

	@Get("discente/:matricula")
	@RequerPermissao(Permissoes.TRABALHO_CONCLUSAO.VISUALIZAR, Permissoes.TRABALHO_CONCLUSAO.VISUALIZAR_TODOS)
	async buscarPorDiscente(@Param("matricula") matricula: string, @UsuarioAtual() usuario: UsuarioEntity) {
		const temPermissaoTotal = await this.permissoesService.usuarioTemPermissaoId(
			usuario.id as string,
			Permissoes.TRABALHO_CONCLUSAO.VISUALIZAR_TODOS,
		);

		if (!temPermissaoTotal) {
			const minhaMatricula = await this.exigirMatricula(usuario.id as string);
			if (matricula !== minhaMatricula) {
				throw new HttpException({ message: "Permissão negada: recurso pertence a outro usuário" }, 403);
			}
		}

		const trabalho = await this.trabalhoConclusaoService.buscarPorDiscente(matricula);

		if (!trabalho) {
			throw new HttpException({ message: "Trabalho de conclusão não encontrado" }, 404);
		}

		return trabalho;
	}

	@Get("discente/:matricula/oferta-atual")
	@RequerPermissao(Permissoes.TRABALHO_CONCLUSAO.VISUALIZAR, Permissoes.TRABALHO_CONCLUSAO.VISUALIZAR_TODOS)
	async buscarPorDiscenteOfertaAtual(@Param("matricula") matricula: string, @UsuarioAtual() usuario: UsuarioEntity) {
		try {
			const temPermissaoTotal = await this.permissoesService.usuarioTemPermissaoId(
				usuario.id as string,
				Permissoes.TRABALHO_CONCLUSAO.VISUALIZAR_TODOS,
			);

			if (!temPermissaoTotal) {
				const minhaMatricula = await this.exigirMatricula(usuario.id as string);
				if (matricula !== minhaMatricula) {
					throw new HttpException({ message: "Permissão negada: recurso pertence a outro usuário" }, 403);
				}
			}

			const trabalho = await this.trabalhoConclusaoService.buscarPorDiscenteOfertaAtual(matricula);

			if (!trabalho) {
				throw new HttpException({ message: "Trabalho de conclusão não encontrado na oferta atual" }, 404);
			}

			return trabalho;
		} catch (error) {
			if (error instanceof HttpException) {
				throw error;
			}
			throw new HttpException({ message: "Erro interno do servidor" }, 500);
		}
	}

	@Get(":id")
	@RequerPermissao(Permissoes.TRABALHO_CONCLUSAO.VISUALIZAR, Permissoes.TRABALHO_CONCLUSAO.VISUALIZAR_TODOS)
	async retornaTrabalhoConlusaoPorId(@Param("id") id: string, @UsuarioAtual() usuario: UsuarioEntity) {
		const trabalho = await this.trabalhoConclusaoService.obterTrabalhoConclusaoPorId(Number(id));

		if (!trabalho) {
			throw new HttpException({ message: "Trabalho de conclusão não encontrado" }, 404);
		}

		const temPermissaoTotal = await this.permissoesService.usuarioTemPermissaoId(
			usuario.id as string,
			Permissoes.TRABALHO_CONCLUSAO.VISUALIZAR_TODOS,
		);

		if (!temPermissaoTotal) {
			const minhaMatricula = await this.exigirMatricula(usuario.id as string);
			if (trabalho.matricula !== minhaMatricula) {
				throw new HttpException({ message: "Permissão negada: recurso pertence a outro usuário" }, 403);
			}
		}

		return { trabalho };
	}

	@Post()
	@HttpCode(HttpStatus.CREATED)
	@RequerPermissao(Permissoes.TRABALHO_CONCLUSAO.CRIAR)
	async criaTrabalhoConlusao(@Body() dadosTrabalho: CriarTrabalhoConclusaoDto) {
		const trabalho = await this.trabalhoConclusaoService.criarTrabalhoConclusao(dadosTrabalho);
		return { message: "Trabalho de conclusão criado com sucesso", id: trabalho.id };
	}

	@Put(":id")
	@RequerPermissao(Permissoes.TRABALHO_CONCLUSAO.EDITAR)
	async atualizaTrabalhoConlusao(
		@Param("id") id: string,
		@Body() dadosAtualizados: AtualizarTrabalhoConclusaoDto,
		@UsuarioAtual() usuario: UsuarioEntity,
	) {
		const temPermissaoTotal = await this.permissoesService.usuarioTemPermissaoId(
			usuario.id as string,
			Permissoes.TRABALHO_CONCLUSAO.VISUALIZAR_TODOS,
		);

		if (!temPermissaoTotal) {
			const minhaMatricula = await this.exigirMatricula(usuario.id as string);
			const pertence = await this.permissoesService.verificarPropriedadeTcc(Number(id), minhaMatricula);
			if (!pertence) {
				throw new HttpException({ message: "Permissão negada: recurso pertence a outro usuário" }, 403);
			}
		}

		const trabalhoAtualizado = await this.trabalhoConclusaoService.atualizarTrabalhoConclusao(
			Number(id),
			dadosAtualizados,
		);

		if (!trabalhoAtualizado) {
			throw new HttpException({ message: "Trabalho de conclusão não encontrado" }, 404);
		}

		return { message: "Trabalho de conclusão atualizado com sucesso", trabalho: trabalhoAtualizado };
	}

	@Delete(":id")
	@RequerPermissao(Permissoes.TRABALHO_CONCLUSAO.DELETAR)
	async deletaTrabalhoConlusao(@Param("id") id: string, @UsuarioAtual() usuario: UsuarioEntity) {
		try {
			const temPermissaoTotal = await this.permissoesService.usuarioTemPermissaoId(
				usuario.id as string,
				Permissoes.TRABALHO_CONCLUSAO.VISUALIZAR_TODOS,
			);

			if (!temPermissaoTotal) {
				const minhaMatricula = await this.exigirMatricula(usuario.id as string);
				const pertence = await this.permissoesService.verificarPropriedadeTcc(Number(id), minhaMatricula);
				if (!pertence) {
					throw new HttpException({ message: "Permissão negada: recurso pertence a outro usuário" }, 403);
				}
			}

			const sucesso = await this.trabalhoConclusaoService.deletarTrabalhoConclusao(Number(id));

			if (!sucesso) {
				throw new HttpException({ message: "Trabalho de conclusão não encontrado" }, 404);
			}

			return { message: "Trabalho de conclusão deletado com sucesso" };
		} catch (error) {
			if (error instanceof HttpException) {
				throw error;
			}
			throw new HttpException({ message: "Erro ao deletar trabalho de conclusão" }, 500);
		}
	}
}
