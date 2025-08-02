const express = require("express");
const ofertaTccService = require("../services/ofertas-tcc-service");
const { auth } = require("../middleware/auth");
const { autorizacao } = require("../middleware/autorizacao");
const { Permissoes } = require("../enums/permissoes");

const ofertasTccRouter = express.Router();

ofertasTccRouter.get(
	"/",
	auth.autenticarUsuario,
	autorizacao.verificarPermissao([
		Permissoes.OFERTA_TCC.VISUALIZAR,
		Permissoes.OFERTA_TCC.VISUALIZAR_TODOS,
	]),
	ofertaTccService.retornaTodasOfertasTcc,
);

// Endpoint para buscar a última oferta TCC
ofertasTccRouter.get(
	"/ultima",
	auth.autenticarUsuario,
	autorizacao.verificarPermissao([
		Permissoes.OFERTA_TCC.VISUALIZAR,
		Permissoes.OFERTA_TCC.VISUALIZAR_TODOS,
	]),
	async (req, res) => {
		try {
			const ultimaOferta = await ofertaTccService.buscarUltimaOfertaTcc();
			if (ultimaOferta) {
				res.json(ultimaOferta);
			} else {
				res.status(404).json({ message: "Nenhuma oferta TCC encontrada" });
			}
		} catch (error) {
			console.error("Erro ao buscar última oferta TCC:", error);
			res.status(500).json({ message: "Erro interno do servidor" });
		}
	}
);

module.exports = ofertasTccRouter;
