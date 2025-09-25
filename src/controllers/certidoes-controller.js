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

module.exports = certidoesController;
