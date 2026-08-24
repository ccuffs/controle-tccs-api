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
import { AtualizarDataDefesaDto } from "./dto/atualizar-data-defesa.dto";
import { CriarDataDefesaDto } from "./dto/criar-data-defesa.dto";
import { FiltrosDatasDefesa } from "./datas-defesa.repository";
import { DatasDefesaService } from "./datas-defesa.service";

/** Porta de src/resources/datas-defesa-resource.js + src/services/datas-defesa-service.js. */
@Controller("datas-defesa")
@UseGuards(JwtAuthGuard, PermissoesGuard)
export class DatasDefesaController {
	constructor(private readonly datasDefesaService: DatasDefesaService) {}

	@Get()
	@RequerPermissao(Permissoes.OFERTA_TCC.VISUALIZAR, Permissoes.OFERTA_TCC.VISUALIZAR_TODAS)
	async retornaTodasDatasDefesa(@Query() query: FiltrosDatasDefesa) {
		const datasDefesa = await this.datasDefesaService.obterTodasDatasDefesa(query);
		return { datasDefesa };
	}

	@Get(":ano/:semestre/:id_curso/:fase")
	@RequerPermissao(Permissoes.OFERTA_TCC.VISUALIZAR, Permissoes.OFERTA_TCC.VISUALIZAR_TODAS)
	async retornaDatasDefesaPorOferta(
		@Param("ano") ano: string,
		@Param("semestre") semestre: string,
		@Param("id_curso") idCurso: string,
		@Param("fase") fase: string,
	) {
		const datasDefesa = await this.datasDefesaService.obterDatasDefesaPorOferta(ano, semestre, idCurso, fase);

		if (!datasDefesa) {
			throw new HttpException({ message: "Datas de defesa não encontradas" }, 404);
		}

		return { datasDefesa };
	}

	@Post()
	@HttpCode(HttpStatus.CREATED)
	@RequerPermissao(Permissoes.OFERTA_TCC.CRIAR, Permissoes.OFERTA_TCC.EDITAR)
	async criaDataDefesa(@Body() dadosDataDefesa: CriarDataDefesaDto) {
		try {
			const novaDataDefesa = await this.datasDefesaService.criarDataDefesa(dadosDataDefesa);
			return { datasDefesa: novaDataDefesa };
		} catch (error) {
			if (error instanceof HttpException) {
				throw error;
			}
			throw new HttpException({ message: "Erro ao criar data de defesa" }, 500);
		}
	}

	@Put(":ano/:semestre/:id_curso/:fase")
	@RequerPermissao(Permissoes.OFERTA_TCC.EDITAR)
	async atualizaDataDefesa(
		@Param("ano") ano: string,
		@Param("semestre") semestre: string,
		@Param("id_curso") idCurso: string,
		@Param("fase") fase: string,
		@Body() dadosDataDefesa: AtualizarDataDefesaDto,
	) {
		try {
			const atualizada = await this.datasDefesaService.atualizarDataDefesa(ano, semestre, idCurso, fase, dadosDataDefesa);

			if (!atualizada) {
				throw new HttpException({ message: "Data de defesa não encontrada" }, 404);
			}

			return { message: "Data de defesa atualizada com sucesso" };
		} catch (error) {
			if (error instanceof HttpException) {
				throw error;
			}
			throw new HttpException({ message: "Erro ao atualizar data de defesa" }, 500);
		}
	}

	@Delete(":ano/:semestre/:id_curso/:fase")
	@RequerPermissao(Permissoes.OFERTA_TCC.DELETAR)
	async deletaDataDefesa(
		@Param("ano") ano: string,
		@Param("semestre") semestre: string,
		@Param("id_curso") idCurso: string,
		@Param("fase") fase: string,
	) {
		try {
			const deleted = await this.datasDefesaService.deletarDataDefesa(ano, semestre, idCurso, fase);

			if (!deleted) {
				throw new HttpException({ message: "Data de defesa não encontrada" }, 404);
			}

			return { message: "Data de defesa deletada com sucesso" };
		} catch (error) {
			if (error instanceof HttpException) {
				throw error;
			}
			throw new HttpException({ message: "Erro ao deletar data de defesa" }, 500);
		}
	}
}
