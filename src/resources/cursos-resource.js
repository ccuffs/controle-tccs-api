const express = require("express");
const cursoService = require("../services/curso-service");
const { auth } = require("../middleware/auth");
const { autorizacao } = require("../middleware/autorizacao");
const { Permissoes } = require("../enums/permissoes");

const cursosResource = express.Router();

cursosResource.get(
	"/",
	auth.autenticarUsuario,
	autorizacao.verificarPermissao([
		Permissoes.CURSO.VISUALIZAR,
		Permissoes.CURSO.VISUALIZAR_TODOS,
	]),
	cursoService.retornaTodosCursos,
);

cursosResource.post(
	"/",
	auth.autenticarUsuario,
	autorizacao.verificarPermissao(Permissoes.CURSO.CRIAR),
	cursoService.criaCurso,
);

cursosResource.put(
	"/",
	auth.autenticarUsuario,
	autorizacao.verificarPermissao(Permissoes.CURSO.EDITAR),
	cursoService.atualizaCurso,
);

cursosResource.delete(
	"/:id",
	auth.autenticarUsuario,
	autorizacao.verificarPermissao(Permissoes.CURSO.DELETAR),
	cursoService.deletaCurso,
);

module.exports = cursosResource;
