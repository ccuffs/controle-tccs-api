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
import { ConvitesService } from "./convites.service";
import { FiltrosConvites } from "./convites.repository";
import { CriarConviteDto } from "./dto/criar-convite.dto";

/** Porta de src/resources/convite-resource.js + src/services/convite-service.js. */
@Controller("convites")
@UseGuards(JwtAuthGuard, PermissoesGuard)
export class ConvitesController {
	constructor(private readonly convitesService: ConvitesService) {}

	@Get()
	@RequerPermissao(Permissoes.CONVITE.VISUALIZAR, Permissoes.CONVITE.VISUALIZAR_TODOS)
	async retornaTodosConvites(@Query() query: FiltrosConvites) {
		const convites = await this.convitesService.obterTodosConvites(query);
		return { convites };
	}

	@Post()
	@HttpCode(HttpStatus.CREATED)
	@RequerPermissao(Permissoes.CONVITE.CRIAR)
	async criaConvite(@Body("formData") formData: CriarConviteDto) {
		await this.convitesService.criarConvite(formData);
		return { message: "Convite criado com sucesso" };
	}

	@Put(":id/:codigo_docente/:fase")
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
	) {
		const sucesso = await this.convitesService.deletarConvite(Number(id), codigoDocente, Number(fase));

		if (!sucesso) {
			throw new HttpException({ message: "Convite não encontrado" }, 404);
		}
	}

	@Get("docente/:codigo")
	@RequerPermissao(Permissoes.CONVITE.VISUALIZAR, Permissoes.CONVITE.VISUALIZAR_TODOS)
	async retornaConvitesDocente(@Param("codigo") codigo: string) {
		const convites = await this.convitesService.obterConvitesDocente(codigo);
		return { convites };
	}
}
