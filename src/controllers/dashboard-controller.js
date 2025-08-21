const express = require("express");
const { auth } = require("../middleware/auth");
const { autorizacao } = require("../middleware/autorizacao");
const { Permissoes } = require("../enums/permissoes");
const dashboardService = require("../services/dashboard-service");

const dashboardController = express.Router();

// GET /api/dashboard/orientadores-definidos
// Retorna contagem de estudantes com orientador principal definido para oferta (ano/semestre/fase) e curso (opcional)
dashboardController.get(
	"/orientadores-definidos",
	auth.autenticarUsuario,
	autorizacao.verificarPermissaoGrupo([
		Permissoes.GRUPOS.ADMIN,
		Permissoes.GRUPOS.PROFESSOR,
		Permissoes.GRUPOS.ORIENTADOR,
	]),
	dashboardService.contarDicentesComOrientador,
);

// GET /api/dashboard/convites-banca-status
// Retorna contagem agregada de convites de banca por status (respondidos vs pendentes)
dashboardController.get(
	"/convites-banca-status",
	auth.autenticarUsuario,
	autorizacao.verificarPermissaoGrupo([
		Permissoes.GRUPOS.ADMIN,
		Permissoes.GRUPOS.PROFESSOR,
		Permissoes.GRUPOS.ORIENTADOR,
	]),
	dashboardService.contarConvitesBancaStatus,
);

// GET /api/dashboard/defesas-agendadas
// Retorna lista de defesas agendadas (tabela) para o período/curso/fase
dashboardController.get(
	"/defesas-agendadas",
	auth.autenticarUsuario,
	autorizacao.verificarPermissaoGrupo([
		Permissoes.GRUPOS.ADMIN,
		Permissoes.GRUPOS.PROFESSOR,
		Permissoes.GRUPOS.ORIENTADOR,
	]),
	dashboardService.listarDefesasAgendadas,
);

// GET /api/dashboard/tcc-por-etapa
// Retorna distribuição de TCCs por etapa
dashboardController.get(
	"/tcc-por-etapa",
	auth.autenticarUsuario,
	autorizacao.verificarPermissaoGrupo([
		Permissoes.GRUPOS.ADMIN,
		Permissoes.GRUPOS.PROFESSOR,
		Permissoes.GRUPOS.ORIENTADOR,
	]),
	dashboardService.contarTccPorEtapa,
);

// GET /api/dashboard/convites-por-periodo
// Retorna série temporal de convites enviados (orientação vs banca) dentro do período do semestre
dashboardController.get(
	"/convites-por-periodo",
	auth.autenticarUsuario,
	autorizacao.verificarPermissaoGrupo([
		Permissoes.GRUPOS.ADMIN,
		Permissoes.GRUPOS.PROFESSOR,
		Permissoes.GRUPOS.ORIENTADOR,
	]),
	dashboardService.contarConvitesPorPeriodo,
);

// GET /api/dashboard/convites-orientacao-status
// Retorna contagem agregada de convites de orientação por status (respondidos vs pendentes)
dashboardController.get(
	"/convites-orientacao-status",
	auth.autenticarUsuario,
	autorizacao.verificarPermissaoGrupo([
		Permissoes.GRUPOS.ADMIN,
		Permissoes.GRUPOS.PROFESSOR,
		Permissoes.GRUPOS.ORIENTADOR,
	]),
	dashboardService.contarConvitesOrientacaoStatus,
);

// GET /api/dashboard/orientandos-por-docente
// Retorna lista com todos os docentes disponíveis em orientador-curso
// e a quantidade de TCCs em que são orientadores principais no período
dashboardController.get(
	"/orientandos-por-docente",
	auth.autenticarUsuario,
	autorizacao.verificarPermissaoGrupo([
		Permissoes.GRUPOS.ADMIN,
		Permissoes.GRUPOS.PROFESSOR,
		Permissoes.GRUPOS.ORIENTADOR,
	]),
	dashboardService.contarOrientandosPorDocente,
);

// GET /api/dashboard/defesas-aceitas-por-docente
// Retorna lista com docentes e a quantidade de defesas aceitas (convites de banca aceitos) no período
dashboardController.get(
	"/defesas-aceitas-por-docente",
	auth.autenticarUsuario,
	autorizacao.verificarPermissaoGrupo([
		Permissoes.GRUPOS.ADMIN,
		Permissoes.GRUPOS.PROFESSOR,
		Permissoes.GRUPOS.ORIENTADOR,
	]),
	dashboardService.contarDefesasAceitasPorDocente,
);

module.exports = dashboardController;
