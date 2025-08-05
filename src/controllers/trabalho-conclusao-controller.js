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

// Buscar trabalho de conclusão por discente
trabalhoConclusaoRouter.get(
	"/discente/:matricula",
	auth.autenticarUsuario,
	autorizacao.verificarPermissao([
		Permissoes.TRABALHO_CONCLUSAO.VISUALIZAR,
		Permissoes.TRABALHO_CONCLUSAO.VISUALIZAR_TODOS,
	]),
	async (req, res) => {
		try {
			const { matricula } = req.params;
			const trabalhoConclusao =
				await trabalhoConclusaoService.buscarPorDiscente(matricula);

			if (trabalhoConclusao) {
				res.json(trabalhoConclusao);
			} else {
				res.status(404).json({
					message: "Trabalho de conclusão não encontrado",
				});
			}
		} catch (error) {
			console.error(
				"Erro ao buscar trabalho de conclusão por discente:",
				error,
			);
			res.status(500).json({ message: "Erro interno do servidor" });
		}
	},
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
