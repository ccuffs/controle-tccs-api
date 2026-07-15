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
import { RequerPermissao } from "../common/decorators/permissoes.decorator";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { PermissoesGuard } from "../common/guards/permissoes.guard";
import { Permissoes } from "../permissoes/permissoes.enum";
import { AtualizarOrientacaoDto } from "./dto/atualizar-orientacao.dto";
import { CriarOrientacaoDto } from "./dto/criar-orientacao.dto";
import { FiltrosOrientacoes } from "./orientacoes.repository";
import { OrientacoesService } from "./orientacoes.service";

/** Porta de src/resources/orientacoes-resource.js + src/services/orientacao-service.js. */
@Controller("orientacoes")
@UseGuards(JwtAuthGuard, PermissoesGuard)
export class OrientacoesController {
	constructor(private readonly orientacoesService: OrientacoesService) {}

	@Get()
	@RequerPermissao(Permissoes.ORIENTACAO.VISUALIZAR, Permissoes.ORIENTACAO.VISUALIZAR_TODAS)
	async retornaTodasOrientacoes(@Query() query: FiltrosOrientacoes) {
		const orientacoes = await this.orientacoesService.obterTodasOrientacoes(query);
		return { orientacoes };
	}

	@Post()
	@HttpCode(HttpStatus.CREATED)
	@RequerPermissao(Permissoes.ORIENTACAO.CRIAR)
	async criaOrientacao(@Body("formData") formData: CriarOrientacaoDto) {
		const orientacao = await this.orientacoesService.criarOrientacao(formData);
		return { message: "Orientação criada com sucesso", id: orientacao.id };
	}

	@Put()
	@RequerPermissao(Permissoes.ORIENTACAO.EDITAR)
	async atualizaOrientacao(@Body("formData") formData: AtualizarOrientacaoDto) {
		await this.orientacoesService.atualizarOrientacao(formData);
		return { message: "Orientação atualizada com sucesso" };
	}

	@Delete(":id")
	@RequerPermissao(Permissoes.ORIENTACAO.DELETAR)
	async deletaOrientacaoPorId(@Param("id") id: string) {
		return this.deletar(id);
	}

	// Rota herdada de orientacoes-resource.js: aponta para o mesmo handler que só lê
	// `:id`, e essa rota não declara `:id` — `id` sempre vem undefined aqui, igual ao
	// legado (o endpoint sempre responde "Orientação não encontrada").
	@Delete(":codigo/:matricula")
	@RequerPermissao(Permissoes.ORIENTACAO.DELETAR)
	async deletaOrientacaoPorCodigoMatricula() {
		return this.deletar(undefined);
	}

	private async deletar(id: string | undefined) {
		const sucesso = await this.orientacoesService.deletarOrientacao(Number(id));

		if (!sucesso) {
			throw new HttpException({ message: "Orientação não encontrada" }, 404);
		}

		return { message: "Orientação deletada com sucesso" };
	}
}
