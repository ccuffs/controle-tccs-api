import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { TrabalhoConclusaoEntity } from "../database/entities";
import { OfertasTccModule } from "../ofertas-tcc/ofertas-tcc.module";
import { PermissoesModule } from "../permissoes/permissoes.module";
import { TrabalhoConclusaoController } from "./trabalho-conclusao.controller";
import { TrabalhoConclusaoRepository } from "./trabalho-conclusao.repository";
import { TrabalhoConclusaoService } from "./trabalho-conclusao.service";

@Module({
	imports: [SequelizeModule.forFeature([TrabalhoConclusaoEntity]), PermissoesModule, OfertasTccModule],
	controllers: [TrabalhoConclusaoController],
	providers: [TrabalhoConclusaoRepository, TrabalhoConclusaoService],
})
export class TrabalhoConclusaoModule {}
