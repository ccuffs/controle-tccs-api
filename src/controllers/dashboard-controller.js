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
	async (req, res) => {
		try {
            const { ano, semestre, id_curso, fase, codigo_docente } = req.query;
			const filtros = {
				ano: ano ? parseInt(ano) : undefined,
				semestre: semestre ? parseInt(semestre) : undefined,
				id_curso: id_curso ? parseInt(id_curso) : undefined,
				fase: fase ? parseInt(fase) : undefined,
                codigo_docente: codigo_docente || undefined,
			};

			const resultado =
				await dashboardService.contarDicentesComOrientador(filtros);
			res.status(200).json(resultado);
		} catch (error) {
			console.error(
				"Erro ao obter contagem de dicentes com orientador definido:",
				error,
			);
			res.status(500).json({ message: "Erro interno do servidor" });
		}
	},
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
	async (req, res) => {
		try {
            const { ano, semestre, id_curso, fase, codigo_docente } = req.query;
			const filtros = {
				ano: ano ? parseInt(ano) : undefined,
				semestre: semestre ? parseInt(semestre) : undefined,
				id_curso: id_curso ? parseInt(id_curso) : undefined,
				fase: fase ? parseInt(fase) : undefined,
                codigo_docente: codigo_docente || undefined,
			};
			const resultado =
				await dashboardService.contarConvitesBancaStatus(filtros);
			res.status(200).json(resultado);
		} catch (error) {
			console.error("Erro ao obter status de convites de banca:", error);
			res.status(500).json({ message: "Erro interno do servidor" });
		}
	},
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
	async (req, res) => {
		try {
            const { ano, semestre, id_curso, fase, codigo_docente } = req.query;
			const filtros = {
				ano: ano ? parseInt(ano) : undefined,
				semestre: semestre ? parseInt(semestre) : undefined,
				id_curso: id_curso ? parseInt(id_curso) : undefined,
				fase: fase ? parseInt(fase) : undefined,
                codigo_docente: codigo_docente || undefined,
			};

			const resultado =
				await dashboardService.listarDefesasAgendadas(filtros);
			res.status(200).json(resultado);
		} catch (error) {
			console.error("Erro ao obter defesas agendadas:", error);
			res.status(500).json({ message: "Erro interno do servidor" });
		}
	},
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
	async (req, res) => {
		try {
            const { ano, semestre, id_curso, fase, codigo_docente } = req.query;
			const filtros = {
				ano: ano ? parseInt(ano) : undefined,
				semestre: semestre ? parseInt(semestre) : undefined,
				id_curso: id_curso ? parseInt(id_curso) : undefined,
				fase: fase ? parseInt(fase) : undefined,
                codigo_docente: codigo_docente || undefined,
			};
			const resultado = await dashboardService.contarTccPorEtapa(filtros);
			res.status(200).json(resultado);
		} catch (error) {
			console.error("Erro ao obter distribuição por etapa:", error);
			res.status(500).json({ message: "Erro interno do servidor" });
		}
	},
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
	async (req, res) => {
		try {
            const { ano, semestre, id_curso, fase, codigo_docente } = req.query;
			const filtros = {
				ano: ano ? parseInt(ano) : undefined,
				semestre: semestre ? parseInt(semestre) : undefined,
				id_curso: id_curso ? parseInt(id_curso) : undefined,
				fase: fase ? parseInt(fase) : undefined,
                codigo_docente: codigo_docente || undefined,
			};
			const resultado =
				await dashboardService.contarConvitesPorPeriodo(filtros);
			res.status(200).json(resultado);
		} catch (error) {
			console.error("Erro ao obter convites por período:", error);
			res.status(500).json({ message: "Erro interno do servidor" });
		}
	},
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
	async (req, res) => {
		try {
			const { ano, semestre, id_curso, fase } = req.query;
			const filtros = {
				ano: ano ? parseInt(ano) : undefined,
				semestre: semestre ? parseInt(semestre) : undefined,
				id_curso: id_curso ? parseInt(id_curso) : undefined,
				fase: fase ? parseInt(fase) : undefined,
			};
			const resultado =
				await dashboardService.contarConvitesOrientacaoStatus(filtros);
			res.status(200).json(resultado);
		} catch (error) {
			console.error(
				"Erro ao obter status de convites de orientação:",
				error,
			);
			res.status(500).json({ message: "Erro interno do servidor" });
		}
	},
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
	async (req, res) => {
		try {
			const { ano, semestre, id_curso, fase } = req.query;
			const filtros = {
				ano: ano ? parseInt(ano) : undefined,
				semestre: semestre ? parseInt(semestre) : undefined,
				id_curso: id_curso ? parseInt(id_curso) : undefined,
				fase: fase ? parseInt(fase) : undefined,
			};

			const resultado =
				await dashboardService.contarOrientandosPorDocente(filtros);
			res.status(200).json(resultado);
		} catch (error) {
			console.error("Erro ao obter orientandos por docente:", error);
			res.status(500).json({ message: "Erro interno do servidor" });
		}
	},
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
	async (req, res) => {
		try {
			const { ano, semestre, id_curso, fase } = req.query;
			const filtros = {
				ano: ano ? parseInt(ano) : undefined,
				semestre: semestre ? parseInt(semestre) : undefined,
				id_curso: id_curso ? parseInt(id_curso) : undefined,
				fase: fase ? parseInt(fase) : undefined,
			};

			const resultado =
				await dashboardService.contarDefesasAceitasPorDocente(filtros);
			res.status(200).json(resultado);
		} catch (error) {
			console.error("Erro ao obter defesas aceitas por docente:", error);
			res.status(500).json({ message: "Erro interno do servidor" });
		}
	},
);

module.exports = dashboardController;
