const express = require("express");
const defesaService = require("../services/defesa-service");
const { auth, passport } = require("../middleware/auth");
const { autorizacao } = require("../middleware/autorizacao");
const { Permissoes } = require("../enums/permissoes");

const router = express.Router();

// Autenticação JWT
router.use(passport.authenticate("jwt", { session: false }));

// GET /api/defesas
router.get(
	"/",
	auth.autenticarUsuario,
	autorizacao.verificarPermissao([
		Permissoes.TRABALHO_CONCLUSAO.VISUALIZAR,
		Permissoes.TRABALHO_CONCLUSAO.VISUALIZAR_TODOS,
	]),
	defesaService.retornaTodasDefesas,
);

// GET /api/defesas/tcc/:id_tcc
router.get(
	"/tcc/:id_tcc",
	auth.autenticarUsuario,
	autorizacao.verificarPermissao([
		Permissoes.TRABALHO_CONCLUSAO.VISUALIZAR,
		Permissoes.TRABALHO_CONCLUSAO.VISUALIZAR_TODOS,
	]),
	defesaService.retornaDefesasPorTcc,
);

// POST /api/defesas/agendar
router.post(
	"/agendar",
	auth.autenticarUsuario,
	autorizacao.verificarPermissao([Permissoes.TRABALHO_CONCLUSAO.CRIAR]),
	defesaService.agendarDefesa,
);

// POST /api/defesas - Criar nova defesa simples
router.post(
	"/",
	auth.autenticarUsuario,
	autorizacao.verificarPermissao([Permissoes.TRABALHO_CONCLUSAO.CRIAR]),
	defesaService.criaDefesa,
);

// POST /api/defesas/gerenciar-banca
router.post(
	"/gerenciar-banca",
	auth.autenticarUsuario,
	autorizacao.verificarPermissao([
		Permissoes.TRABALHO_CONCLUSAO.CRIAR,
		Permissoes.TRABALHO_CONCLUSAO.EDITAR,
	]),
	defesaService.gerenciarBancaDefesa,
);

// PUT /api/defesas/avaliacao/:id_tcc
router.put(
	"/avaliacao/:id_tcc",
	auth.autenticarUsuario,
	autorizacao.verificarPermissao([Permissoes.TRABALHO_CONCLUSAO.EDITAR]),
	defesaService.registraAvaliacaoDefesa,
);

// PUT /api/defesas/:id_tcc/:membro_banca
router.put(
	"/:id_tcc/:membro_banca",
	auth.autenticarUsuario,
	autorizacao.verificarPermissao([Permissoes.TRABALHO_CONCLUSAO.EDITAR]),
	defesaService.atualizaDefesa,
);

// DELETE /api/defesas/:id_tcc/:membro_banca/:fase
router.delete(
	"/:id_tcc/:membro_banca/:fase",
	auth.autenticarUsuario,
	autorizacao.verificarPermissao([Permissoes.TRABALHO_CONCLUSAO.DELETAR]),
	defesaService.deletaDefesa,
);

module.exports = router;
