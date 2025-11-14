const express = require("express");
const orientacaoService = require("../services/orientacao-service");
const { auth } = require("../middleware/auth");
const { autorizacao } = require("../middleware/autorizacao");
const { Permissoes } = require("../enums/permissoes");

const orientacoesResource = express.Router();

orientacoesResource.get(
	"/",
	auth.autenticarUsuario,
	autorizacao.verificarPermissao([
		Permissoes.ORIENTACAO.VISUALIZAR,
		Permissoes.ORIENTACAO.VISUALIZAR_TODOS,
	]),
	orientacaoService.retornaTodasOrientacoes,
);

orientacoesResource.post(
	"/",
	auth.autenticarUsuario,
	autorizacao.verificarPermissao(Permissoes.ORIENTACAO.CRIAR),
	orientacaoService.criaOrientacao,
);

orientacoesResource.put(
	"/",
	auth.autenticarUsuario,
	autorizacao.verificarPermissao(Permissoes.ORIENTACAO.EDITAR),
	orientacaoService.atualizaOrientacao,
);

orientacoesResource.delete(
	"/:id",
	auth.autenticarUsuario,
	autorizacao.verificarPermissao(Permissoes.ORIENTACAO.DELETAR),
	orientacaoService.deletaOrientacao,
);

orientacoesResource.delete(
	"/:codigo/:matricula",
	auth.autenticarUsuario,
	autorizacao.verificarPermissao(Permissoes.ORIENTACAO.DELETAR),
	orientacaoService.deletaOrientacao,
);

module.exports = orientacoesResource;
