const express = require("express");
const { auth } = require("../middleware/auth");
const { autorizacao } = require("../middleware/autorizacao");
const { Permissoes } = require("../enums/permissoes");
const certidoesService = require("../services/certidoes-service");

const certidoesController = express.Router();

// GET /api/certidoes
// Listar certidões do docente (trabalhos onde foi orientador ou membro de banca)
certidoesController.get(
	"/",
	auth.autenticarUsuario,
	autorizacao.verificarPermissaoGrupo([
		Permissoes.GRUPOS.ORIENTADOR,
		Permissoes.GRUPOS.PROFESSOR,
		Permissoes.GRUPOS.ADMIN,
	]),
	certidoesService.listarCertidoes,
);

// GET /api/certidoes/gerar/:idTcc/:tipoParticipacao
// Gerar certidão específica em HTML
certidoesController.get(
	"/gerar/:idTcc/:tipoParticipacao",
	auth.autenticarUsuario,
	autorizacao.verificarPermissaoGrupo([
		Permissoes.GRUPOS.ORIENTADOR,
		Permissoes.GRUPOS.PROFESSOR,
		Permissoes.GRUPOS.ADMIN,
	]),
	certidoesService.gerarCertidao,
);

module.exports = certidoesController;
