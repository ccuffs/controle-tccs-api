const express = require("express");
const areaTccService = require("../services/area-tcc-service");
const { auth } = require("../middleware/auth");
const { autorizacao } = require("../middleware/autorizacao");
const { Permissoes } = require("../enums/permissoes");

const areaTccController = express.Router();

areaTccController.get(
	"/",
	auth.autenticarUsuario,
	autorizacao.verificarPermissao([
		Permissoes.AREA_TCC.VISUALIZAR,
		Permissoes.AREA_TCC.VISUALIZAR_TODAS,
	]),
	areaTccService.retornaTodasAreasTcc,
);

areaTccController.get(
	"/docente/:codigo",
	auth.autenticarUsuario,
	autorizacao.verificarPermissao([
		Permissoes.AREA_TCC.VISUALIZAR,
		Permissoes.AREA_TCC.VISUALIZAR_TODAS,
	]),
	areaTccService.retornaAreasTccPorDocente,
);

areaTccController.post(
	"/",
	auth.autenticarUsuario,
	autorizacao.verificarPermissao(Permissoes.AREA_TCC.CRIAR),
	areaTccService.criaAreaTcc,
);

areaTccController.put(
	"/",
	auth.autenticarUsuario,
	autorizacao.verificarPermissao(Permissoes.AREA_TCC.EDITAR),
	areaTccService.atualizaAreaTcc,
);

areaTccController.delete(
	"/:id",
	auth.autenticarUsuario,
	autorizacao.verificarPermissao(Permissoes.AREA_TCC.DELETAR),
	areaTccService.deletaAreaTcc,
);

module.exports = areaTccController;
