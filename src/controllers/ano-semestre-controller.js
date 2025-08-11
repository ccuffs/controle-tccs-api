const express = require("express");
const { auth } = require("../middleware/auth");
const { obterAnoSemestreAtual } = require("../services/ano-semestre-service");
const anoSemestreRepository = require("../repository/ano-semestre-repository");

const anoSemestreController = express.Router();

// GET /api/ano-semestre/atual - retorna ano/semestre atual baseado nas regras de negócio
anoSemestreController.get(
	"/atual",
	auth.autenticarUsuario,
	async (req, res) => {
		try {
			const atual = await obterAnoSemestreAtual();
			res.status(200).json(atual);
		} catch (error) {
			console.error("Erro ao obter ano/semestre atual:", error);
			res.status(500).json({ message: "Erro interno do servidor" });
		}
	},
);

// GET /api/ano-semestre - lista todos os períodos cadastrados (para filtros)
anoSemestreController.get("/", auth.autenticarUsuario, async (req, res) => {
	try {
		const lista = await anoSemestreRepository.obterTodosAnoSemestres();
		res.status(200).json(lista);
	} catch (error) {
		console.error("Erro ao listar ano/semestre:", error);
		res.status(500).json({ message: "Erro interno do servidor" });
	}
});

module.exports = anoSemestreController;
