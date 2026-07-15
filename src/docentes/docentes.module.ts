import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { DocenteEntity } from "../database/entities";
import { PermissoesModule } from "../permissoes/permissoes.module";
import { DocentesController } from "./docentes.controller";
import { DocentesRepository } from "./docentes.repository";
import { DocentesService } from "./docentes.service";

@Module({
	imports: [SequelizeModule.forFeature([DocenteEntity]), PermissoesModule],
	controllers: [DocentesController],
	providers: [DocentesRepository, DocentesService],
	exports: [DocentesService, DocentesRepository],
})
export class DocentesModule {}
