const express = require("express");
const trabalhoConclusaoService = require("../services/trabalho-conclusao-service");
const { auth } = require("../middleware/auth");
const { autorizacao } = require("../middleware/autorizacao");
const { Permissoes } = require("../enums/permissoes");

const trabalhoConclusaoRouter = express.Router();

class TrabalhoConclusaoController {
    async buscarPorDiscente(req, res) {
        try {
            const { matricula } = req.params;
            const trabalhoConclusao = await trabalhoConclusaoService.buscarPorDiscente(matricula);

            if (trabalhoConclusao) {
                res.json(trabalhoConclusao);
            } else {
                res.status(404).json({ message: "Trabalho de conclusão não encontrado" });
            }
        } catch (error) {
            console.error("Erro ao buscar trabalho de conclusão por discente:", error);
            res.status(500).json({ message: "Erro interno do servidor" });
        }
    }

    async criar(req, res) {
        try {
            const dadosTcc = req.body;
            const novoTcc = await trabalhoConclusaoService.criar(dadosTcc);
            res.status(201).json(novoTcc);
        } catch (error) {
            console.error("Erro ao criar trabalho de conclusão:", error);
            res.status(500).json({ message: "Erro interno do servidor" });
        }
    }

    async atualizar(req, res) {
        try {
            const { id } = req.params;
            const dadosAtualizados = req.body;
            const tccAtualizado = await trabalhoConclusaoService.atualizar(id, dadosAtualizados);

            if (tccAtualizado) {
                res.json(tccAtualizado);
            } else {
                res.status(404).json({ message: "Trabalho de conclusão não encontrado" });
            }
        } catch (error) {
            console.error("Erro ao atualizar trabalho de conclusão:", error);
            res.status(500).json({ message: "Erro interno do servidor" });
        }
    }

    async buscarPorId(req, res) {
        try {
            const { id } = req.params;
            const trabalhoConclusao = await trabalhoConclusaoService.buscarPorId(id);

            if (trabalhoConclusao) {
                res.json(trabalhoConclusao);
            } else {
                res.status(404).json({ message: "Trabalho de conclusão não encontrado" });
            }
        } catch (error) {
            console.error("Erro ao buscar trabalho de conclusão por ID:", error);
            res.status(500).json({ message: "Erro interno do servidor" });
        }
    }
}

const controller = new TrabalhoConclusaoController();

// Rotas
trabalhoConclusaoRouter.get(
    "/discente/:matricula",
    auth.autenticarUsuario,
    autorizacao.verificarPermissao([
        Permissoes.TRABALHO_CONCLUSAO.VISUALIZAR,
    ]),
    controller.buscarPorDiscente
);

trabalhoConclusaoRouter.post(
    "/",
    auth.autenticarUsuario,
    autorizacao.verificarPermissao(Permissoes.TRABALHO_CONCLUSAO.CRIAR),
    controller.criar
);

trabalhoConclusaoRouter.put(
    "/:id",
    auth.autenticarUsuario,
    autorizacao.verificarPermissao(Permissoes.TRABALHO_CONCLUSAO.EDITAR),
    controller.atualizar
);

trabalhoConclusaoRouter.get(
    "/:id",
    auth.autenticarUsuario,
    autorizacao.verificarPermissao([
        Permissoes.TRABALHO_CONCLUSAO.VISUALIZAR,
    ]),
    controller.buscarPorId
);

module.exports = trabalhoConclusaoRouter;