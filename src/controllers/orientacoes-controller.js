const express = require("express");
const orientacaoService = require("../services/orientacao-service");
const { auth } = require("../middleware/auth");
const { autorizacao } = require("../middleware/autorizacao");
const { Permissoes } = require("../enums/permissoes");
const orientacoesService = express.Router();

orientacoesService.get(
	"/",
	auth.autenticarUsuario,
	autorizacao.verificarPermissao([
		Permissoes.ORIENTACAO.VISUALIZAR,
		Permissoes.ORIENTACAO.VISUALIZAR_TODOS,
	]),
	orientacaoService.retornaTodasOrientacoes,
);

orientacoesService.post(
	"/",
	auth.autenticarUsuario,
	autorizacao.verificarPermissao(Permissoes.ORIENTACAO.CRIAR),
	orientacaoService.criaOrientacao,
);

orientacoesService.put(
	"/",
	auth.autenticarUsuario,
	autorizacao.verificarPermissao(Permissoes.ORIENTACAO.EDITAR),
	orientacaoService.atualizaOrientacao,
);

orientacoesService.delete(
	"/:id",
	auth.autenticarUsuario,
	autorizacao.verificarPermissao(Permissoes.ORIENTACAO.DELETAR),
	orientacaoService.deletaOrientacao,
);

orientacoesService.delete(
	"/:codigo/:matricula",
	auth.autenticarUsuario,
	autorizacao.verificarPermissao(Permissoes.ORIENTACAO.DELETAR),
	orientacaoService.deletaOrientacao,
);

module.exports = orientacoesService;
