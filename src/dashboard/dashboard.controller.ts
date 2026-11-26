import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { RequerGrupo } from "../common/decorators/grupos.decorator";
import { UsuarioAtual } from "../common/decorators/usuario-atual.decorator";
import { GruposGuard } from "../common/guards/grupos.guard";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { UsuarioEntity } from "../database/entities";
import { Permissoes } from "../permissoes/permissoes.enum";
import { DashboardService } from "./dashboard.service";
import { FiltrosDashboardDto } from "./dto/filtros-dashboard.dto";
import { EscopoDocenteService } from "./escopo-docente.service";

/** Porta de src/resources/dashboard-resource.js + src/services/dashboard-service.js. */
@Controller("dashboard")
@UseGuards(JwtAuthGuard, GruposGuard)
@RequerGrupo(
	Permissoes.GRUPOS.ADMIN,
	Permissoes.GRUPOS.PROFESSOR_CCR,
	Permissoes.GRUPOS.ORIENTADOR,
	Permissoes.GRUPOS.PROFESSOR,
	Permissoes.GRUPOS.BANCA,
)
export class DashboardController {
	constructor(
		private readonly dashboardService: DashboardService,
		private readonly escopo: EscopoDocenteService,
	) {}

	@Get("orientadores-definidos")
	async contarDicentesComOrientador(@Query() query: FiltrosDashboardDto, @UsuarioAtual() usuario: UsuarioEntity) {
		return this.dashboardService.calcularDicentesComOrientador(await this.escopo.aplicar(usuario.id as string, query));
	}

	@Get("convites-banca-status")
	async contarConvitesBancaStatus(@Query() query: FiltrosDashboardDto, @UsuarioAtual() usuario: UsuarioEntity) {
		return this.dashboardService.calcularConvitesBancaStatus(await this.escopo.aplicar(usuario.id as string, query));
	}

	@Get("defesas-agendadas")
	async listarDefesasAgendadas(@Query() query: FiltrosDashboardDto, @UsuarioAtual() usuario: UsuarioEntity) {
		return this.dashboardService.buscarDefesasAgendadas(await this.escopo.aplicar(usuario.id as string, query));
	}

	@Get("tcc-por-etapa")
	async contarTccPorEtapa(@Query() query: FiltrosDashboardDto, @UsuarioAtual() usuario: UsuarioEntity) {
		return this.dashboardService.calcularTccPorEtapa(await this.escopo.aplicar(usuario.id as string, query));
	}

	@Get("convites-por-periodo")
	async contarConvitesPorPeriodo(@Query() query: FiltrosDashboardDto, @UsuarioAtual() usuario: UsuarioEntity) {
		return this.dashboardService.calcularConvitesPorPeriodo(await this.escopo.aplicar(usuario.id as string, query));
	}

	@Get("convites-orientacao-status")
	async contarConvitesOrientacaoStatus(@Query() query: FiltrosDashboardDto, @UsuarioAtual() usuario: UsuarioEntity) {
		return this.dashboardService.calcularConvitesOrientacaoStatus(await this.escopo.aplicar(usuario.id as string, query));
	}

	@Get("orientandos-por-docente")
	async contarOrientandosPorDocente(@Query() query: FiltrosDashboardDto, @UsuarioAtual() usuario: UsuarioEntity) {
		return this.dashboardService.calcularOrientandosPorDocente(await this.escopo.aplicar(usuario.id as string, query));
	}

	@Get("defesas-aceitas-por-docente")
	async contarDefesasAceitasPorDocente(@Query() query: FiltrosDashboardDto, @UsuarioAtual() usuario: UsuarioEntity) {
		return this.dashboardService.calcularDefesasAceitasPorDocente(await this.escopo.aplicar(usuario.id as string, query));
	}

	@Get("estudantes-sem-convite-banca")
	async listarEstudantesSemConviteBanca(@Query() query: FiltrosDashboardDto, @UsuarioAtual() usuario: UsuarioEntity) {
		return this.dashboardService.calcularEstudantesSemConviteBanca(await this.escopo.aplicar(usuario.id as string, query));
	}

	@Get("docentes-sem-disponibilidade-banca")
	async listarDocentesSemDisponibilidadeBanca(@Query() query: FiltrosDashboardDto, @UsuarioAtual() usuario: UsuarioEntity) {
		return this.dashboardService.calcularDocentesSemDisponibilidadeBanca(await this.escopo.aplicar(usuario.id as string, query));
	}
}
