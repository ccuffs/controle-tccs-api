const express = require("express");
const defesaService = require("../services/defesa-service");
const { auth, passport } = require("../middleware/auth");
const { autorizacao } = require("../middleware/autorizacao");
const { Permissoes } = require("../enums/permissoes");

const defesaResource = express.Router();

// GET /api/defesas
defesaResource.get(
	"/",
	auth.autenticarUsuario,
	autorizacao.verificarPermissao([
		Permissoes.TRABALHO_CONCLUSAO.VISUALIZAR,
		Permissoes.TRABALHO_CONCLUSAO.VISUALIZAR_TODOS,
	]),
	defesaService.retornaTodasDefesas,
);

// GET /api/defesas/tcc/:id_tcc
defesaResource.get(
	"/tcc/:id_tcc",
	auth.autenticarUsuario,
	autorizacao.verificarPermissao([
		Permissoes.TRABALHO_CONCLUSAO.VISUALIZAR,
		Permissoes.TRABALHO_CONCLUSAO.VISUALIZAR_TODOS,
	]),
	defesaService.retornaDefesasPorTcc,
);

// POST /api/defesas/agendar
defesaResource.post(
	"/agendar",
	auth.autenticarUsuario,
	autorizacao.verificarPermissao([Permissoes.TRABALHO_CONCLUSAO.CRIAR]),
	defesaService.agendarDefesa,
);

// POST /api/defesas - Criar nova defesa simples
defesaResource.post(
	"/",
	auth.autenticarUsuario,
	autorizacao.verificarPermissao([Permissoes.TRABALHO_CONCLUSAO.CRIAR]),
	defesaService.criaDefesa,
);

// POST /api/defesas/gerenciar-banca
defesaResource.post(
	"/gerenciar-banca",
	auth.autenticarUsuario,
	autorizacao.verificarPermissao([
		Permissoes.TRABALHO_CONCLUSAO.CRIAR,
		Permissoes.TRABALHO_CONCLUSAO.EDITAR,
	]),
	defesaService.gerenciarBancaDefesa,
);

// PUT /api/defesas/avaliacao/:id_tcc
defesaResource.put(
	"/avaliacao/:id_tcc",
	auth.autenticarUsuario,
	autorizacao.verificarPermissao([Permissoes.TRABALHO_CONCLUSAO.EDITAR]),
	defesaService.registraAvaliacaoDefesa,
);

// PUT /api/defesas/:id_tcc/:membro_banca
defesaResource.put(
	"/:id_tcc/:membro_banca",
	auth.autenticarUsuario,
	autorizacao.verificarPermissao([Permissoes.TRABALHO_CONCLUSAO.EDITAR]),
	defesaService.atualizaDefesa,
);

// DELETE /api/defesas/:id_tcc/:membro_banca/:fase
defesaResource.delete(
	"/:id_tcc/:membro_banca/:fase",
	auth.autenticarUsuario,
	autorizacao.verificarPermissao([Permissoes.TRABALHO_CONCLUSAO.DELETAR]),
	defesaService.deletaDefesa,
);

// POST /api/defesas/membro-externo
defesaResource.post(
	"/membro-externo",
	auth.autenticarUsuario,
	autorizacao.verificarPermissaoGrupo([
		Permissoes.GRUPOS.ORIENTADOR,
		Permissoes.GRUPOS.PROFESSOR_CCR,
		Permissoes.GRUPOS.ADMIN,
	]),
	defesaService.adicionarMembroExterno,
);

// GET /api/defesas/ata/:id_tcc/:fase
defesaResource.get(
	"/ata/:id_tcc/:fase",
	auth.autenticarUsuario,
	autorizacao.verificarPermissao([
		Permissoes.TRABALHO_CONCLUSAO.VISUALIZAR,
		Permissoes.TRABALHO_CONCLUSAO.VISUALIZAR_TODOS,
	]),
	defesaService.gerarAtaDefesa,
);

// GET /api/defesas/externos/tcc/:id_tcc
defesaResource.get(
	"/externos/tcc/:id_tcc",
	auth.autenticarUsuario,
	autorizacao.verificarPermissao([
		Permissoes.TRABALHO_CONCLUSAO.VISUALIZAR,
		Permissoes.TRABALHO_CONCLUSAO.VISUALIZAR_TODOS,
	]),
	defesaService.listarMembrosExternosTcc,
);

// DELETE /api/defesas/externo/:id_tcc/:codigo_docente/:fase
defesaResource.delete(
	"/externo/:id_tcc/:codigo_docente/:fase",
	auth.autenticarUsuario,
	autorizacao.verificarPermissaoGrupo([
		Permissoes.GRUPOS.ORIENTADOR,
		Permissoes.GRUPOS.PROFESSOR_CCR,
		Permissoes.GRUPOS.ADMIN,
	]),
	defesaService.removerMembroExterno,
);

module.exports = defesaResource;
