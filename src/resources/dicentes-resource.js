const express = require("express");
const dicenteService = require("../services/dicente-service");
const { auth } = require("../middleware/auth");
const { autorizacao } = require("../middleware/autorizacao");
const { Permissoes } = require("../enums/permissoes");
const { upload } = require("../services/dicente-service");

const dicentesResource = express.Router();

// Rotas existentes
dicentesResource.get(
	"/",
	auth.autenticarUsuario,
	autorizacao.verificarPermissao([
		Permissoes.DICENTE.VISUALIZAR,
		Permissoes.DICENTE.VISUALIZAR_TODOS,
	]),
	dicenteService.retornaTodosDicentes,
);

dicentesResource.post(
	"/",
	auth.autenticarUsuario,
	autorizacao.verificarPermissao(Permissoes.DICENTE.CRIAR),
	dicenteService.criaDicente,
);

dicentesResource.put(
	"/:matricula",
	auth.autenticarUsuario,
	dicenteService.atualizaDicente,
);

dicentesResource.delete(
	"/:matricula",
	auth.autenticarUsuario,
	autorizacao.verificarPermissao(Permissoes.DICENTE.DELETAR),
	dicenteService.deletaDicente,
);

// Rota para buscar dicente por usuário (administrativa)
dicentesResource.get(
	"/usuario/:id_usuario",
	auth.autenticarUsuario,
	autorizacao.verificarPermissao([
		Permissoes.DICENTE.VISUALIZAR,
		Permissoes.DICENTE.VISUALIZAR_TODOS,
	]),
	dicenteService.retornaDicentePorUsuario,
);

// Rota para o dicente obter seus próprios dados
dicentesResource.get(
	"/meu-perfil",
	auth.autenticarUsuario,
	dicenteService.retornaDicentePorUsuario,
);

// Nova rota para processar PDF
dicentesResource.post(
	"/processar-pdf",
	upload.single("pdf"),
	auth.autenticarUsuario,
	autorizacao.verificarPermissao(Permissoes.DICENTE.CRIAR),
	dicenteService.processarEInserirPDFDicentes,
);

module.exports = dicentesResource;
