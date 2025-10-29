const express = require("express");
const areaTccService = require("../services/area-tcc-service");
const { auth } = require("../middleware/auth");
const { autorizacao } = require("../middleware/autorizacao");
const { Permissoes } = require("../enums/permissoes");

const areaTccResource = express.Router();

areaTccResource.get(
	"/",
	auth.autenticarUsuario,
	autorizacao.verificarPermissao([
		Permissoes.AREA_TCC.VISUALIZAR,
		Permissoes.AREA_TCC.VISUALIZAR_TODAS,
	]),
	areaTccService.retornaTodasAreasTcc,
);

areaTccResource.get(
	"/docente/:codigo",
	auth.autenticarUsuario,
	autorizacao.verificarPermissao([
		Permissoes.AREA_TCC.VISUALIZAR,
		Permissoes.AREA_TCC.VISUALIZAR_TODAS,
	]),
	areaTccService.retornaAreasTccPorDocente,
);

areaTccResource.post(
	"/",
	auth.autenticarUsuario,
	autorizacao.verificarPermissao(Permissoes.AREA_TCC.CRIAR),
	areaTccService.criaAreaTcc,
);

areaTccResource.put(
	"/",
	auth.autenticarUsuario,
	autorizacao.verificarPermissao(Permissoes.AREA_TCC.EDITAR),
	areaTccService.atualizaAreaTcc,
);

areaTccResource.delete(
	"/:id",
	auth.autenticarUsuario,
	autorizacao.verificarPermissao(Permissoes.AREA_TCC.DELETAR),
	areaTccService.deletaAreaTcc,
);

module.exports = areaTccResource;
