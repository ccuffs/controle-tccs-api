const express = require("express");
const trabalhoConclusaoService = require("../services/trabalho-conclusao-service");
const { auth } = require("../middleware/auth");
const { autorizacao } = require("../middleware/autorizacao");
const { Permissoes } = require("../enums/permissoes");

const trabalhoConclusaoRouter = express.Router();

// Listar todos os trabalhos de conclusão
trabalhoConclusaoRouter.get(
	"/",
	auth.autenticarUsuario,
	autorizacao.verificarPermissao([
		Permissoes.TRABALHO_CONCLUSAO.VISUALIZAR,
		Permissoes.TRABALHO_CONCLUSAO.VISUALIZAR_TODOS,
	]),
	trabalhoConclusaoService.retornaTodosTrabalhosConlusao,
);

// Buscar trabalho de conclusão por ID
trabalhoConclusaoRouter.get(
	"/:id",
	auth.autenticarUsuario,
	autorizacao.verificarPermissao([
		Permissoes.TRABALHO_CONCLUSAO.VISUALIZAR,
		Permissoes.TRABALHO_CONCLUSAO.VISUALIZAR_TODOS,
	]),
	trabalhoConclusaoService.retornaTrabalhoConlusaoPorId,
);

// Buscar trabalho de conclusão mais recente por discente (qual	quer oferta)
trabalhoConclusaoRouter.get(
	"/discente/:matricula",
	auth.autenticarUsuario,
	autorizacao.verificarPermissao([
		Permissoes.TRABALHO_CONCLUSAO.VISUALIZAR,
		Permissoes.TRABALHO_CONCLUSAO.VISUALIZAR_TODOS,
	]),
	trabalhoConclusaoService.buscarPorDiscente,
);

// Buscar trabalho de conclusão por discente na oferta atual
trabalhoConclusaoRouter.get(
	"/discente/:matricula/oferta-atual",
	auth.autenticarUsuario,
	autorizacao.verificarPermissao([
		Permissoes.TRABALHO_CONCLUSAO.VISUALIZAR,
		Permissoes.TRABALHO_CONCLUSAO.VISUALIZAR_TODOS,
	]),
	trabalhoConclusaoService.buscarPorDiscenteOfertaAtual,
);

// Criar novo trabalho de conclusão
trabalhoConclusaoRouter.post(
	"/",
	auth.autenticarUsuario,
	autorizacao.verificarPermissao(Permissoes.TRABALHO_CONCLUSAO.CRIAR),
	trabalhoConclusaoService.criaTrabalhoConlusao,
);

// Atualizar trabalho de conclusão
trabalhoConclusaoRouter.put(
	"/:id",
	auth.autenticarUsuario,
	autorizacao.verificarPermissao(Permissoes.TRABALHO_CONCLUSAO.EDITAR),
	trabalhoConclusaoService.atualizaTrabalhoConlusao,
);

// Deletar trabalho de conclusão
trabalhoConclusaoRouter.delete(
	"/:id",
	auth.autenticarUsuario,
	autorizacao.verificarPermissao(Permissoes.TRABALHO_CONCLUSAO.DELETAR),
	trabalhoConclusaoService.deletaTrabalhoConlusao,
);

module.exports = trabalhoConclusaoRouter;
