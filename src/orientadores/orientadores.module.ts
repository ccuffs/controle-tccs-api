import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { OrientadorCursoEntity } from "../database/entities";
import { PermissoesModule } from "../permissoes/permissoes.module";
import { OrientadoresController } from "./orientadores.controller";
import { OrientadoresRepository } from "./orientadores.repository";
import { OrientadoresService } from "./orientadores.service";

@Module({
	imports: [SequelizeModule.forFeature([OrientadorCursoEntity]), PermissoesModule],
	controllers: [OrientadoresController],
	providers: [OrientadoresRepository, OrientadoresService],
})
export class OrientadoresModule {}
