const express = require("express");
const ofertaTccService = require("../services/ofertas-tcc-service");
const { auth } = require("../middleware/auth");
const { autorizacao } = require("../middleware/autorizacao");
const { Permissoes } = require("../enums/permissoes");

const ofertasTccService = express.Router();

ofertasTccService.get(
	"/",
	auth.autenticarUsuario,
	autorizacao.verificarPermissao([
		Permissoes.OFERTA_TCC.VISUALIZAR,
		Permissoes.OFERTA_TCC.VISUALIZAR_TODOS,
	]),
	ofertaTccService.retornaTodasOfertasTcc,
);

module.exports = ofertasTccService;
