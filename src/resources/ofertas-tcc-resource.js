const express = require("express");
const ofertaTccService = require("../services/ofertas-tcc-service");
const { auth } = require("../middleware/auth");
const { autorizacao } = require("../middleware/autorizacao");
const { Permissoes } = require("../enums/permissoes");

const ofertasTccResource = express.Router();

ofertasTccResource.get(
	"/",
	auth.autenticarUsuario,
	autorizacao.verificarPermissao([
		Permissoes.OFERTA_TCC.VISUALIZAR,
		Permissoes.OFERTA_TCC.VISUALIZAR_TODOS,
	]),
	ofertaTccService.retornaTodasOfertasTcc,
);

// Endpoint para buscar a última oferta TCC
ofertasTccResource.get(
	"/ultima",
	auth.autenticarUsuario,
	autorizacao.verificarPermissao([
		Permissoes.OFERTA_TCC.VISUALIZAR,
		Permissoes.OFERTA_TCC.VISUALIZAR_TODOS,
	]),
	ofertaTccService.buscarUltimaOfertaTcc,
);

module.exports = ofertasTccResource;
