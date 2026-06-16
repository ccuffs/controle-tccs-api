const express = require("express");
const { auth } = require("../middleware/auth");
const { autorizacao } = require("../middleware/autorizacao");
const { Permissoes } = require("../enums/permissoes");
const declaracoesService = require("../services/declaracoes-service");

const declaracoesResource = express.Router();

// GET /api/declaracoes
// Listar declarações do docente (trabalhos onde foi orientador ou membro de banca)
declaracoesResource.get(
	"/",
	auth.autenticarUsuario,
	autorizacao.verificarPermissaoGrupo([
		Permissoes.GRUPOS.ORIENTADOR,
		Permissoes.GRUPOS.PROFESSOR_CCR,
		Permissoes.GRUPOS.BANCA,
		Permissoes.GRUPOS.ADMIN,
	]),
	declaracoesService.listarDeclaracoes,
);

// GET /api/declaracoes/gerar/:idTcc/:tipoParticipacao
// Gerar declaração específica em HTML
declaracoesResource.get(
	"/gerar/:idTcc/:tipoParticipacao",
	auth.autenticarUsuario,
	autorizacao.verificarPermissaoGrupo([
		Permissoes.GRUPOS.ORIENTADOR,
		Permissoes.GRUPOS.PROFESSOR_CCR,
		Permissoes.GRUPOS.BANCA,
		Permissoes.GRUPOS.ADMIN,
	]),
	declaracoesService.gerarDeclaracao,
);

// GET /api/declaracoes/externas
// Listar declarações de membros externos que o orientador pode emitir
declaracoesResource.get(
	"/externas",
	auth.autenticarUsuario,
	autorizacao.verificarPermissaoGrupo([
		Permissoes.GRUPOS.ORIENTADOR,
		Permissoes.GRUPOS.PROFESSOR_CCR,
		Permissoes.GRUPOS.ADMIN,
	]),
	declaracoesService.listarDeclaracoesExternas,
);

// GET /api/declaracoes/gerar-externo/:idTcc/:codigoDocente
// Gerar declaração para membro externo (orientador emite em nome do externo)
declaracoesResource.get(
	"/gerar-externo/:idTcc/:codigoDocente",
	auth.autenticarUsuario,
	autorizacao.verificarPermissaoGrupo([
		Permissoes.GRUPOS.ORIENTADOR,
		Permissoes.GRUPOS.PROFESSOR_CCR,
		Permissoes.GRUPOS.ADMIN,
	]),
	declaracoesService.gerarDeclaracaoExterno,
);

module.exports = declaracoesResource;
