const express = require("express");
const orientacaoService = require("../services/orientacao-service");
const orientacoesService = express.Router();

orientacoesService.get("/", orientacaoService.retornaTodasOrientacoes);

orientacoesService.post("/", orientacaoService.criaOrientacao);

orientacoesService.put("/", orientacaoService.atualizaOrientacao);

orientacoesService.delete(
	"/:codigo/:matricula",
	orientacaoService.deletaOrientacao,
);

module.exports = orientacoesService;
