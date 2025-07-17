const express = require("express");
const orientadorService = require("../services/orientadores-service");
const orientadoresService = express.Router();

// Listar todas as orientações
orientadoresService.get("/", orientadorService.retornaTodasOrientacoes);

// Listar orientações por docente
orientadoresService.get("/docente/:codigo", orientadorService.retornaOrientacoesPorDocente);

// Listar orientações por curso
orientadoresService.get("/curso/:id", orientadorService.retornaOrientacoesPorCurso);

// Adicionar nova orientação
orientadoresService.post("/", orientadorService.criaOrientacao);

// Remover orientação
orientadoresService.delete("/:id_curso/:codigo_docente", orientadorService.deletaOrientacao);

module.exports = orientadoresService;