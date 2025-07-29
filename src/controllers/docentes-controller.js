const express = require("express");
const docenteService = require("../services/docentes-service");
const { auth } = require("../middleware/auth");
const { autorizacao } = require("../middleware/autorizacao");
const { Permissoes } = require("../enums/permissoes");

const docentesService = express.Router();

docentesService.get(
	"/",
	auth.autenticarUsuario,
	autorizacao.verificarPermissao([
		Permissoes.DOCENTE.VISUALIZAR,
		Permissoes.DOCENTE.VISUALIZAR_TODOS,
	]),
	docenteService.retornaTodosDocentes,
);

docentesService.post(
	"/",
	auth.autenticarUsuario,
	autorizacao.verificarPermissao(Permissoes.DOCENTE.CRIAR),
	docenteService.criaDocente,
);

docentesService.put(
	"/",
	auth.autenticarUsuario,
	autorizacao.verificarPermissao(Permissoes.DOCENTE.EDITAR),
	docenteService.atualizaDocente,
);

docentesService.delete(
	"/:codigo",
	auth.autenticarUsuario,
	autorizacao.verificarPermissao(Permissoes.DOCENTE.DELETAR),
	docenteService.deletaDocente,
);

module.exports = docentesService;
