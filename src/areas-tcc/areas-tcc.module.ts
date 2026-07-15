import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { AreaTccEntity } from "../database/entities";
import { PermissoesModule } from "../permissoes/permissoes.module";
import { AreasTccController } from "./areas-tcc.controller";
import { AreasTccRepository } from "./areas-tcc.repository";
import { AreasTccService } from "./areas-tcc.service";

@Module({
	imports: [SequelizeModule.forFeature([AreaTccEntity]), PermissoesModule],
	controllers: [AreasTccController],
	providers: [AreasTccRepository, AreasTccService],
})
export class AreasTccModule {}
