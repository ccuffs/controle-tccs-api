const express = require("express");
const areaTccService = require("../services/area-tcc-service");
const areaTccController = express.Router();

areaTccController.get("/", areaTccService.retornaTodasAreasTcc);
areaTccController.get("/docente/:codigo", areaTccService.retornaAreasTccPorDocente);
areaTccController.post("/", areaTccService.criaAreaTcc);
areaTccController.put("/", areaTccService.atualizaAreaTcc);
areaTccController.delete("/:id", areaTccService.deletaAreaTcc);

module.exports = areaTccController;