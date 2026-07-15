import { Body, Controller, Delete, Get, HttpCode, HttpException, Param, Post, Put, UseGuards } from "@nestjs/common";
import { RequerPermissao } from "../common/decorators/permissoes.decorator";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { PermissoesGuard } from "../common/guards/permissoes.guard";
import { Permissoes } from "../permissoes/permissoes.enum";
import { AreasTccService } from "./areas-tcc.service";
import { AtualizarAreaTccDto } from "./dto/atualizar-area-tcc.dto";
import { CriarAreaTccDto } from "./dto/criar-area-tcc.dto";

/** Porta de src/resources/area-tcc-resource.js + src/services/area-tcc-service.js. */
@Controller("areas-tcc")
@UseGuards(JwtAuthGuard, PermissoesGuard)
export class AreasTccController {
	constructor(private readonly areasTccService: AreasTccService) {}

	@Get()
	@RequerPermissao(Permissoes.AREA_TCC.VISUALIZAR, Permissoes.AREA_TCC.VISUALIZAR_TODAS)
	async retornaTodasAreasTcc() {
		const areas = await this.areasTccService.obterTodasAreasTcc();
		return { areas };
	}

	@Get("docente/:codigo")
	@RequerPermissao(Permissoes.AREA_TCC.VISUALIZAR, Permissoes.AREA_TCC.VISUALIZAR_TODAS)
	async retornaAreasTccPorDocente(@Param("codigo") codigo: string) {
		const areas = await this.areasTccService.obterAreasTccPorDocente(codigo);
		return { areas };
	}

	@Post()
	@HttpCode(200)
	@RequerPermissao(Permissoes.AREA_TCC.CRIAR)
	async criaAreaTcc(@Body("formData") formData: CriarAreaTccDto) {
		await this.areasTccService.criarAreaTcc(formData);
	}

	@Put()
	@HttpCode(200)
	@RequerPermissao(Permissoes.AREA_TCC.EDITAR)
	async atualizaAreaTcc(@Body("formData") formData: AtualizarAreaTccDto) {
		const sucesso = await this.areasTccService.atualizarAreaTcc(formData);

		if (!sucesso) {
			throw new HttpException({ message: "Área TCC não encontrada" }, 404);
		}
	}

	@Delete(":id")
	@HttpCode(200)
	@RequerPermissao(Permissoes.AREA_TCC.DELETAR)
	async deletaAreaTcc(@Param("id") id: string) {
		try {
			const sucesso = await this.areasTccService.deletarAreaTcc(Number(id));

			if (!sucesso) {
				throw new HttpException({ message: "Área TCC não encontrada" }, 404);
			}
		} catch (error) {
			if (error instanceof HttpException) {
				throw error;
			}
			throw new HttpException({ message: "Erro ao deletar área TCC" }, 500);
		}
	}
}
