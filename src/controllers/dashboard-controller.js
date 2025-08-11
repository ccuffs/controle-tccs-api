const express = require("express");
const { auth } = require("../middleware/auth");
const dashboardService = require("../services/dashboard-service");

const dashboardController = express.Router();

// GET /api/dashboard/orientadores-definidos
// Retorna contagem de estudantes com orientador principal definido para oferta (ano/semestre/fase) e curso (opcional)
dashboardController.get(
  "/orientadores-definidos",
  auth.autenticarUsuario,
  async (req, res) => {
    try {
      const { ano, semestre, id_curso, fase = 1 } = req.query;
      const filtros = {
        ano: ano ? parseInt(ano) : undefined,
        semestre: semestre ? parseInt(semestre) : undefined,
        id_curso: id_curso ? parseInt(id_curso) : undefined,
        fase: fase ? parseInt(fase) : 1,
      };

      const resultado = await dashboardService.contarDicentesComOrientador(
        filtros,
      );
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

module.exports = dashboardController;
// GET /api/dashboard/tcc-por-etapa
// Retorna distribuição de TCCs por etapa
dashboardController.get(
  "/tcc-por-etapa",
  auth.autenticarUsuario,
  async (req, res) => {
    try {
      const { ano, semestre, id_curso, fase = 1 } = req.query;
      const filtros = {
        ano: ano ? parseInt(ano) : undefined,
        semestre: semestre ? parseInt(semestre) : undefined,
        id_curso: id_curso ? parseInt(id_curso) : undefined,
        fase: fase ? parseInt(fase) : 1,
      };
      const resultado = await dashboardService.contarTccPorEtapa(filtros);
      res.status(200).json(resultado);
    } catch (error) {
      console.error("Erro ao obter distribuição por etapa:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  },
);


