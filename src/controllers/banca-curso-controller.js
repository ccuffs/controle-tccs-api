const express = require("express");
const bancaCursoService = require("../services/banca-curso-service");
const { auth } = require("../middleware/auth");
const { autorizacao } = require("../middleware/autorizacao");
const { Permissoes } = require("../enums/permissoes");
const bancaCursoRouter = express.Router();

// Listar docentes de banca por curso
bancaCursoRouter.get(
	"/curso/:id",
	auth.autenticarUsuario,
	autorizacao.verificarPermissao([
		Permissoes.ORIENTACAO.VISUALIZAR,
		Permissoes.ORIENTACAO.VISUALIZAR_TODAS,
		Permissoes.TRABALHO_CONCLUSAO.VISUALIZAR,
		Permissoes.TRABALHO_CONCLUSAO.VISUALIZAR_TODAS,
	]),
	bancaCursoService.retornaDocentesBancaPorCurso,
);

// Listar cursos por docente de banca
bancaCursoRouter.get(
	"/docente/:codigo",
	auth.autenticarUsuario,
	autorizacao.verificarPermissao([
		Permissoes.ORIENTACAO.VISUALIZAR,
		Permissoes.ORIENTACAO.VISUALIZAR_TODAS,
	]),
	bancaCursoService.retornaCursosPorDocenteBanca,
);

// Verificar se docente pode participar de banca
bancaCursoRouter.get(
	"/verificar/:idCurso/:codigoDocente",
	auth.autenticarUsuario,
	autorizacao.verificarPermissao([
		Permissoes.ORIENTACAO.VISUALIZAR,
		Permissoes.ORIENTACAO.VISUALIZAR_TODAS,
	]),
	bancaCursoService.verificarDocenteBanca,
);

module.exports = bancaCursoRouter;
