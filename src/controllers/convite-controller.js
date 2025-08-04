const express = require("express");
const router = express.Router();
const conviteService = require("../services/convite-service");
const { passport } = require("../middleware/auth");
const { auth } = require("../middleware/auth");
const { autorizacao } = require("../middleware/autorizacao");
const { Permissoes } = require("../enums/permissoes");

// Middleware de autenticação para todas as rotas
router.use(passport.authenticate("jwt", { session: false }));

// GET /api/convites - Retorna todos os convites com filtros
router.get(
	"/",
	auth.autenticarUsuario,
	autorizacao.verificarPermissao([
		Permissoes.ORIENTACAO.VISUALIZAR,
		Permissoes.ORIENTACAO.VISUALIZAR_TODOS,
		Permissoes.TRABALHO_CONCLUSAO.VISUALIZAR,
		Permissoes.TRABALHO_CONCLUSAO.VISUALIZAR_TODOS,
	]),
	conviteService.retornaTodosConvites,
);

// POST /api/convites - Cria um novo convite
router.post(
	"/",
	auth.autenticarUsuario,
	autorizacao.verificarPermissao([Permissoes.ORIENTACAO.CRIAR]),
	conviteService.criaConvite,
);

// PUT /api/convites/:id/:codigo_docente - Responde a um convite (aceitar/rejeitar)
router.put(
	"/:id/:codigo_docente",
	auth.autenticarUsuario,
	autorizacao.verificarPermissao([Permissoes.ORIENTACAO.EDITAR]),
	conviteService.respondeConvite,
);

// DELETE /api/convites/:id/:codigo_docente - Deleta um convite
router.delete(
	"/:id/:codigo_docente",
	auth.autenticarUsuario,
	autorizacao.verificarPermissao([Permissoes.ORIENTACAO.DELETAR]),
	conviteService.deletaConvite,
);

// GET /api/convites/docente/:codigo - Retorna convites de um docente
router.get(
	"/docente/:codigo",
	auth.autenticarUsuario,
	autorizacao.verificarPermissao([
		Permissoes.ORIENTACAO.VISUALIZAR,
		Permissoes.ORIENTACAO.VISUALIZAR_TODOS,
	]),
	conviteService.retornaConvitesDocente,
);

module.exports = router;
