import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { RequerGrupo } from "../common/decorators/grupos.decorator";
import { GruposGuard } from "../common/guards/grupos.guard";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { Permissoes } from "../permissoes/permissoes.enum";
import { DashboardService } from "./dashboard.service";
import { FiltrosDashboardDto } from "./dto/filtros-dashboard.dto";

/** Porta de src/resources/dashboard-resource.js + src/services/dashboard-service.js. */
@Controller("dashboard")
@UseGuards(JwtAuthGuard, GruposGuard)
@RequerGrupo(Permissoes.GRUPOS.ADMIN, Permissoes.GRUPOS.PROFESSOR_CCR, Permissoes.GRUPOS.ORIENTADOR)
export class DashboardController {
	constructor(private readonly dashboardService: DashboardService) {}

	@Get("orientadores-definidos")
	contarDicentesComOrientador(@Query() query: FiltrosDashboardDto) {
		return this.dashboardService.calcularDicentesComOrientador(query);
	}

	@Get("convites-banca-status")
	contarConvitesBancaStatus(@Query() query: FiltrosDashboardDto) {
		return this.dashboardService.calcularConvitesBancaStatus(query);
	}

	@Get("defesas-agendadas")
	listarDefesasAgendadas(@Query() query: FiltrosDashboardDto) {
		return this.dashboardService.buscarDefesasAgendadas(query);
	}

	@Get("tcc-por-etapa")
	contarTccPorEtapa(@Query() query: FiltrosDashboardDto) {
		return this.dashboardService.calcularTccPorEtapa(query);
	}

	@Get("convites-por-periodo")
	contarConvitesPorPeriodo(@Query() query: FiltrosDashboardDto) {
		return this.dashboardService.calcularConvitesPorPeriodo(query);
	}

	@Get("convites-orientacao-status")
	contarConvitesOrientacaoStatus(@Query() query: FiltrosDashboardDto) {
		return this.dashboardService.calcularConvitesOrientacaoStatus(query);
	}

	@Get("orientandos-por-docente")
	contarOrientandosPorDocente(@Query() query: FiltrosDashboardDto) {
		return this.dashboardService.calcularOrientandosPorDocente(query);
	}

	@Get("defesas-aceitas-por-docente")
	contarDefesasAceitasPorDocente(@Query() query: FiltrosDashboardDto) {
		return this.dashboardService.calcularDefesasAceitasPorDocente(query);
	}

	@Get("estudantes-sem-convite-banca")
	listarEstudantesSemConviteBanca(@Query() query: FiltrosDashboardDto) {
		return this.dashboardService.calcularEstudantesSemConviteBanca(query);
	}

	@Get("docentes-sem-disponibilidade-banca")
	listarDocentesSemDisponibilidadeBanca(@Query() query: FiltrosDashboardDto) {
		return this.dashboardService.calcularDocentesSemDisponibilidadeBanca(query);
	}
}
