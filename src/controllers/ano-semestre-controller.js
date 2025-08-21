const express = require("express");
const { auth } = require("../middleware/auth");
const anoSemestreService = require("../services/ano-semestre-service");

const anoSemestreController = express.Router();

// GET /api/ano-semestre/atual - retorna ano/semestre atual baseado nas regras de negócio
anoSemestreController.get(
	"/atual",
	auth.autenticarUsuario,
	anoSemestreService.obterAnoSemestreAtual,
);

// GET /api/ano-semestre - lista todos os períodos cadastrados (para filtros)
anoSemestreController.get(
	"/",
	auth.autenticarUsuario,
	anoSemestreService.listarTodosAnoSemestres,
);

module.exports = anoSemestreController;
