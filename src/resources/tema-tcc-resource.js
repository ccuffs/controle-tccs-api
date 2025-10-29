const express = require("express");
const temaTccService = require("../services/tema-tcc-service");
const { auth } = require("../middleware/auth");
const { autorizacao } = require("../middleware/autorizacao");
const { Permissoes } = require("../enums/permissoes");

const temaTccResource = express.Router();

// Rotas para temas de TCC
temaTccResource.get(
	"/",
	auth.autenticarUsuario,
	autorizacao.verificarPermissao([
		Permissoes.TEMA_TCC.VISUALIZAR,
		Permissoes.TEMA_TCC.VISUALIZAR_TODOS,
	]),
	temaTccService.retornaTodosTemasTcc,
);

temaTccResource.get(
	"/curso/:id_curso",
	auth.autenticarUsuario,
	autorizacao.verificarPermissao([
		Permissoes.TEMA_TCC.VISUALIZAR,
		Permissoes.TEMA_TCC.VISUALIZAR_TODOS,
	]),
	temaTccService.retornaTemasTccPorCurso,
);

temaTccResource.get(
	"/docente/:codigo",
	auth.autenticarUsuario,
	autorizacao.verificarPermissao([
		Permissoes.TEMA_TCC.VISUALIZAR,
		Permissoes.TEMA_TCC.VISUALIZAR_TODOS,
	]),
	temaTccService.retornaTemasTccPorDocente,
);

// Novo endpoint para buscar temas de um orientador por curso
temaTccResource.get(
	"/docente/:codigo/curso/:id_curso",
	auth.autenticarUsuario,
	autorizacao.verificarPermissao([
		Permissoes.TEMA_TCC.VISUALIZAR,
		Permissoes.TEMA_TCC.VISUALIZAR_TODOS,
	]),
	temaTccService.retornaTemasTccPorDocenteECurso,
);

temaTccResource.post(
	"/",
	auth.autenticarUsuario,
	autorizacao.verificarPermissao(Permissoes.TEMA_TCC.CRIAR),
	temaTccService.criaTemaTcc,
);

temaTccResource.put(
	"/",
	auth.autenticarUsuario,
	autorizacao.verificarPermissao(Permissoes.TEMA_TCC.EDITAR),
	temaTccService.atualizaTemaTcc,
);

temaTccResource.patch(
	"/:id/vagas",
	auth.autenticarUsuario,
	autorizacao.verificarPermissao(Permissoes.TEMA_TCC.EDITAR),
	temaTccService.atualizaVagasTemaTcc,
);

temaTccResource.patch(
	"/docente/:codigo_docente/curso/:id_curso/vagas",
	auth.autenticarUsuario,
	autorizacao.verificarPermissao(Permissoes.TEMA_TCC.EDITAR),
	temaTccService.atualizaVagasOfertaDocente,
);

temaTccResource.delete(
	"/:id",
	auth.autenticarUsuario,
	autorizacao.verificarPermissao(Permissoes.TEMA_TCC.DELETAR),
	temaTccService.deletaTemaTcc,
);

module.exports = temaTccResource;
