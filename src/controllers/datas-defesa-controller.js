const express = require("express");
const datasDefesaService = require("../services/datas-defesa-service");
const { auth } = require("../middleware/auth");
const { autorizacao } = require("../middleware/autorizacao");
const { Permissoes } = require("../enums/permissoes");

const datasDefesaRouter = express.Router();

// Buscar todas as datas de defesa
datasDefesaRouter.get(
	"/",
	auth.autenticarUsuario,
	autorizacao.verificarPermissao([
		Permissoes.OFERTA_TCC.VISUALIZAR,
		Permissoes.OFERTA_TCC.VISUALIZAR_TODOS,
	]),
	datasDefesaService.retornaTodasDatasDefesa,
);

// Buscar datas de defesa por oferta específica
datasDefesaRouter.get(
	"/:ano/:semestre/:id_curso/:fase",
	auth.autenticarUsuario,
	autorizacao.verificarPermissao([
		Permissoes.OFERTA_TCC.VISUALIZAR,
		Permissoes.OFERTA_TCC.VISUALIZAR_TODOS,
	]),
	datasDefesaService.retornaDatasDefesaPorOferta,
);

// Criar nova data de defesa
datasDefesaRouter.post(
	"/",
	auth.autenticarUsuario,
	autorizacao.verificarPermissao([
		Permissoes.OFERTA_TCC.CRIAR,
		Permissoes.OFERTA_TCC.EDITAR,
	]),
	datasDefesaService.criaDataDefesa,
);

// Atualizar data de defesa
datasDefesaRouter.put(
	"/:ano/:semestre/:id_curso/:fase",
	auth.autenticarUsuario,
	autorizacao.verificarPermissao([Permissoes.OFERTA_TCC.EDITAR]),
	datasDefesaService.atualizaDataDefesa,
);

// Deletar data de defesa
datasDefesaRouter.delete(
	"/:ano/:semestre/:id_curso/:fase",
	auth.autenticarUsuario,
	autorizacao.verificarPermissao([Permissoes.OFERTA_TCC.DELETAR]),
	datasDefesaService.deletaDataDefesa,
);

module.exports = datasDefesaRouter;
