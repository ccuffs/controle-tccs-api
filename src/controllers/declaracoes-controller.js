const express = require("express");
const { auth } = require("../middleware/auth");
const { autorizacao } = require("../middleware/autorizacao");
const { Permissoes } = require("../enums/permissoes");
const declaracoesService = require("../services/declaracoes-service");

const declaracoesController = express.Router();

// GET /api/declaracoes
// Listar declarações do docente (trabalhos onde foi orientador ou membro de banca)
declaracoesController.get(
	"/",
	auth.autenticarUsuario,
	autorizacao.verificarPermissaoGrupo([
		Permissoes.GRUPOS.ORIENTADOR,
		Permissoes.GRUPOS.PROFESSOR,
		Permissoes.GRUPOS.ADMIN,
	]),
	declaracoesService.listarDeclaracoes,
);

// GET /api/declaracoes/gerar/:idTcc/:tipoParticipacao
// Gerar declaração específica em HTML
declaracoesController.get(
	"/gerar/:idTcc/:tipoParticipacao",
	auth.autenticarUsuario,
	autorizacao.verificarPermissaoGrupo([
		Permissoes.GRUPOS.ORIENTADOR,
		Permissoes.GRUPOS.PROFESSOR,
		Permissoes.GRUPOS.ADMIN,
	]),
	declaracoesService.gerarDeclaracao,
);

module.exports = declaracoesController;
