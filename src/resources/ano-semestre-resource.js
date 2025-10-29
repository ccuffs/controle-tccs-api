const express = require("express");
const { auth } = require("../middleware/auth");
const anoSemestreService = require("../services/ano-semestre-service");

const anoSemestreResource = express.Router();

// GET /api/ano-semestre/atual - retorna ano/semestre atual baseado nas regras de negócio
anoSemestreResource.get(
	"/atual",
	auth.autenticarUsuario,
	anoSemestreService.obterAnoSemestreAtual,
);

// GET /api/ano-semestre - lista todos os períodos cadastrados (para filtros)
anoSemestreResource.get(
	"/",
	auth.autenticarUsuario,
	anoSemestreService.listarTodosAnoSemestres,
);

module.exports = anoSemestreResource;
