import { Controller, Get, HttpException, Query, UseGuards } from "@nestjs/common";
import { RequerPermissao } from "../common/decorators/permissoes.decorator";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { PermissoesGuard } from "../common/guards/permissoes.guard";
import { Permissoes } from "../permissoes/permissoes.enum";
import { FiltrosOfertaTcc, OfertasTccService } from "./ofertas-tcc.service";

/**
 * Porta de src/resources/ofertas-tcc-resource.js. Só as 2 rotas que o resource legado
 * realmente monta (`/` e `/ultima`) — as demais funções do service antigo
 * (criar/atualizar/deletar/ofertas-ativas) não têm rota HTTP hoje, só são reaproveitadas
 * internamente por outros services (trabalho-conclusao, tema-tcc), o que também é feito
 * aqui via OfertasTccService injetado nesses módulos futuros.
 */
@Controller("ofertas-tcc")
@UseGuards(JwtAuthGuard, PermissoesGuard)
export class OfertasTccController {
	constructor(private readonly ofertasTccService: OfertasTccService) {}

	@Get()
	@RequerPermissao(Permissoes.OFERTA_TCC.VISUALIZAR, Permissoes.OFERTA_TCC.VISUALIZAR_TODAS)
	async retornaTodasOfertasTcc(@Query() query: FiltrosOfertaTcc) {
		const ofertas = await this.ofertasTccService.obterTodasOfertasTcc(query);
		return { ofertas };
	}

	@Get("ultima")
	@RequerPermissao(Permissoes.OFERTA_TCC.VISUALIZAR, Permissoes.OFERTA_TCC.VISUALIZAR_TODAS)
	async buscarUltimaOfertaTcc() {
		const ultimaOferta = await this.ofertasTccService.obterUltimaOfertaTcc();

		if (!ultimaOferta) {
			throw new HttpException({ message: "Nenhuma oferta TCC encontrada" }, 404);
		}

		return ultimaOferta;
	}
}
