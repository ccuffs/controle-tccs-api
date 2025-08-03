const express = require("express");
const orientadorService = require("../services/orientadores-service");
const { auth } = require("../middleware/auth");
const { autorizacao } = require("../middleware/autorizacao");
const { Permissoes } = require("../enums/permissoes");
const orientadoresService = express.Router();

// Listar todas as orientações
orientadoresService.get(
	"/",
	auth.autenticarUsuario,
	autorizacao.verificarPermissao([
		Permissoes.ORIENTACAO.VISUALIZAR,
		Permissoes.ORIENTACAO.VISUALIZAR_TODOS,
		Permissoes.TRABALHO_CONCLUSAO.VISUALIZAR,
		Permissoes.TRABALHO_CONCLUSAO.VISUALIZAR_TODOS,
	]),
	orientadorService.retornaTodasOrientacoes,
);

// Listar orientações por docente
orientadoresService.get(
	"/docente/:codigo",
	auth.autenticarUsuario,
	autorizacao.verificarPermissao([
		Permissoes.ORIENTACAO.VISUALIZAR,
		Permissoes.ORIENTACAO.VISUALIZAR_TODOS,
	]),
	orientadorService.retornaOrientacoesPorDocente,
);

// Listar orientações por curso
orientadoresService.get(
	"/curso/:id",
	auth.autenticarUsuario,
	autorizacao.verificarPermissao([
		Permissoes.ORIENTACAO.VISUALIZAR,
		Permissoes.ORIENTACAO.VISUALIZAR_TODOS,
		Permissoes.TRABALHO_CONCLUSAO.VISUALIZAR,
		Permissoes.TRABALHO_CONCLUSAO.VISUALIZAR_TODOS,
	]),
	orientadorService.retornaOrientacoesPorCurso,
);

// Adicionar nova orientação
orientadoresService.post(
	"/",
	auth.autenticarUsuario,
	autorizacao.verificarPermissao(Permissoes.ORIENTACAO.CRIAR),
	orientadorService.criaOrientacao,
);

// Remover orientação
orientadoresService.delete(
	"/:id_curso/:codigo_docente",
	auth.autenticarUsuario,
	autorizacao.verificarPermissao(Permissoes.ORIENTACAO.DELETAR),
	orientadorService.deletaOrientacao,
);

module.exports = orientadoresService;
