const express = require("express");
const temaTccService = require("../services/tema-tcc-service");
const temaTccController = express.Router();

// Rotas para temas de TCC
temaTccController.get("/", temaTccService.retornaTodosTemasTcc);
temaTccController.get("/curso/:id_curso", temaTccService.retornaTemasTccPorCurso);
temaTccController.get("/docente/:codigo", temaTccService.retornaTemasTccPorDocente);
temaTccController.post("/", temaTccService.criaTemaTcc);
temaTccController.put("/", temaTccService.atualizaTemaTcc);
temaTccController.patch("/:id/vagas", temaTccService.atualizaVagasTemaTcc); // Atualiza vagas do tema
temaTccController.delete("/:id", temaTccService.deletaTemaTcc);

module.exports = temaTccController;