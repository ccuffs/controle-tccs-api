const express = require("express");
const temaTccService = require("../services/tema-tcc-service");
const { auth } = require("../middleware/auth");
const { autorizacao } = require("../middleware/autorizacao");
const { Permissoes } = require("../enums/permissoes");

const temaTccController = express.Router();

// Rotas para temas de TCC
temaTccController.get(
	"/",
	auth.autenticarUsuario,
	autorizacao.verificarPermissao([
		Permissoes.TEMA_TCC.VISUALIZAR,
		Permissoes.TEMA_TCC.VISUALIZAR_TODOS,
	]),
	temaTccService.retornaTodosTemasTcc,
);

temaTccController.get(
	"/curso/:id_curso",
	auth.autenticarUsuario,
	autorizacao.verificarPermissao([
		Permissoes.TEMA_TCC.VISUALIZAR,
		Permissoes.TEMA_TCC.VISUALIZAR_TODOS,
	]),
	temaTccService.retornaTemasTccPorCurso,
);

temaTccController.get(
	"/docente/:codigo",
	auth.autenticarUsuario,
	autorizacao.verificarPermissao([
		Permissoes.TEMA_TCC.VISUALIZAR,
		Permissoes.TEMA_TCC.VISUALIZAR_TODOS,
	]),
	temaTccService.retornaTemasTccPorDocente,
);

temaTccController.post(
	"/",
	auth.autenticarUsuario,
	autorizacao.verificarPermissao(Permissoes.TEMA_TCC.CRIAR),
	temaTccService.criaTemaTcc,
);

temaTccController.put(
	"/",
	auth.autenticarUsuario,
	autorizacao.verificarPermissao(Permissoes.TEMA_TCC.EDITAR),
	temaTccService.atualizaTemaTcc,
);

temaTccController.patch(
	"/:id/vagas",
	auth.autenticarUsuario,
	autorizacao.verificarPermissao(Permissoes.TEMA_TCC.EDITAR),
	temaTccService.atualizaVagasTemaTcc,
);

temaTccController.patch(
	"/docente/:codigo_docente/curso/:id_curso/vagas",
	auth.autenticarUsuario,
	autorizacao.verificarPermissao(Permissoes.TEMA_TCC.EDITAR),
	temaTccService.atualizaVagasOfertaDocente,
);

temaTccController.delete(
	"/:id",
	auth.autenticarUsuario,
	autorizacao.verificarPermissao(Permissoes.TEMA_TCC.DELETAR),
	temaTccService.deletaTemaTcc,
);

module.exports = temaTccController;
