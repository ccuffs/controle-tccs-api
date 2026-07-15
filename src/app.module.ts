import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AnoSemestreModule } from "./ano-semestre/ano-semestre.module";
import { AppController } from "./app.controller";
import { AreasTccModule } from "./areas-tcc/areas-tcc.module";
import { AuthModule } from "./auth/auth.module";
import { BancaCursoModule } from "./banca-curso/banca-curso.module";
import { ConvitesModule } from "./convites/convites.module";
import { CursosModule } from "./cursos/cursos.module";
import { DashboardModule } from "./dashboard/dashboard.module";
import { DatabaseModule } from "./database/database.module";
import { DatasDefesaModule } from "./datas-defesa/datas-defesa.module";
import { DeclaracoesModule } from "./declaracoes/declaracoes.module";
import { DefesasModule } from "./defesas/defesas.module";
import { DicentesModule } from "./dicentes/dicentes.module";
import { DisponibilidadeBancaModule } from "./disponibilidade-banca/disponibilidade-banca.module";
import { DocentesModule } from "./docentes/docentes.module";
import { OfertasTccModule } from "./ofertas-tcc/ofertas-tcc.module";
import { OrientacoesModule } from "./orientacoes/orientacoes.module";
import { OrientadoresModule } from "./orientadores/orientadores.module";
import { PermissoesModule } from "./permissoes/permissoes.module";
import { TemasTccModule } from "./temas-tcc/temas-tcc.module";
import { TrabalhoConclusaoModule } from "./trabalho-conclusao/trabalho-conclusao.module";

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true }),
		DatabaseModule,
		PermissoesModule,
		AuthModule,
		DocentesModule,
		CursosModule,
		OrientadoresModule,
		BancaCursoModule,
		DicentesModule,
		AnoSemestreModule,
		AreasTccModule,
		OfertasTccModule,
		TemasTccModule,
		TrabalhoConclusaoModule,
		OrientacoesModule,
		ConvitesModule,
		DatasDefesaModule,
		DisponibilidadeBancaModule,
		DefesasModule,
		DashboardModule,
		DeclaracoesModule,
	],
	controllers: [AppController],
})
export class AppModule {}
