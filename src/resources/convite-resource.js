const express = require("express");
const conviteService = require("../services/convite-service");
const { auth } = require("../middleware/auth");
const { autorizacao } = require("../middleware/autorizacao");
const { Permissoes } = require("../enums/permissoes");

const conviteResource = express.Router();

// GET /api/convites - Retorna todos os convites com filtros
conviteResource.get(
	"/",
	auth.autenticarUsuario,
	autorizacao.verificarPermissao([
		Permissoes.CONVITE.VISUALIZAR,
		Permissoes.CONVITE.VISUALIZAR_TODOS,
	]),
	conviteService.retornaTodosConvites,
);

// POST /api/convites - Cria um novo convite
conviteResource.post(
	"/",
	auth.autenticarUsuario,
	autorizacao.verificarPermissao([Permissoes.CONVITE.CRIAR]),
	conviteService.criaConvite,
);

// PUT /api/convites/:id/:codigo_docente/:fase - Responde a um convite (aceitar/rejeitar)
conviteResource.put(
	"/:id/:codigo_docente/:fase",
	auth.autenticarUsuario,
	autorizacao.verificarPermissao([Permissoes.CONVITE.EDITAR]),
	conviteService.respondeConvite,
);

// DELETE /api/convites/:id/:codigo_docente/:fase - Deleta um convite
conviteResource.delete(
	"/:id/:codigo_docente/:fase",
	auth.autenticarUsuario,
	autorizacao.verificarPermissao([Permissoes.CONVITE.DELETAR]),
	conviteService.deletaConvite,
);

// GET /api/convites/docente/:codigo - Retorna convites de um docente
conviteResource.get(
	"/docente/:codigo",
	auth.autenticarUsuario,
	autorizacao.verificarPermissao([
		Permissoes.CONVITE.VISUALIZAR,
		Permissoes.CONVITE.VISUALIZAR_TODOS,
	]),
	conviteService.retornaConvitesDocente,
);

module.exports = conviteResource;
