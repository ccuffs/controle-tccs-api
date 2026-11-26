import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import {
	ConviteEntity,
	DefesaEntity,
	DicenteEntity,
	DocenteEntity,
	OrientacaoEntity,
	TrabalhoConclusaoEntity,
} from "../database/entities";
import { PermissoesModule } from "../permissoes/permissoes.module";
import { AcompanhamentoRepository } from "./acompanhamento.repository";
import { AcompanhamentoService } from "./acompanhamento.service";
import { OrientacoesController } from "./orientacoes.controller";
import { OrientacoesRepository } from "./orientacoes.repository";
import { OrientacoesService } from "./orientacoes.service";

@Module({
	imports: [SequelizeModule.forFeature([
			OrientacaoEntity,
			TrabalhoConclusaoEntity,
			DicenteEntity,
			DocenteEntity,
			ConviteEntity,
			DefesaEntity,
		]), PermissoesModule],
	controllers: [OrientacoesController],
	providers: [OrientacoesRepository, OrientacoesService, AcompanhamentoRepository, AcompanhamentoService],
	exports: [OrientacoesService, OrientacoesRepository],
})
export class OrientacoesModule {}
