const express = require("express");
const cursoService = require("../services/curso-service");
const { auth } = require("../middleware/auth");
const { autorizacao } = require("../middleware/autorizacao");
const { Permissoes } = require("../enums/permissoes");

const cursosService = express.Router();

cursosService.get(
	"/",
	auth.autenticarUsuario,
	autorizacao.verificarPermissao([
		Permissoes.CURSO.VISUALIZAR,
		Permissoes.CURSO.VISUALIZAR_TODOS,
	]),
	cursoService.retornaTodosCursos,
);

cursosService.post(
	"/",
	auth.autenticarUsuario,
	autorizacao.verificarPermissao(Permissoes.CURSO.CRIAR),
	cursoService.criaCurso,
);

cursosService.put(
	"/",
	auth.autenticarUsuario,
	autorizacao.verificarPermissao(Permissoes.CURSO.EDITAR),
	cursoService.atualizaCurso,
);

cursosService.delete(
	"/:id",
	auth.autenticarUsuario,
	autorizacao.verificarPermissao(Permissoes.CURSO.DELETAR),
	cursoService.deletaCurso,
);

module.exports = cursosService;
