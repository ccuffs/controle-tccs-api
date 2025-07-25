const express = require("express");
const projetoTccService = require("../services/projeto-tcc-service");
const projetoTccController = express.Router();

projetoTccController.get("/", projetoTccService.retornaTodosProjetosTcc);
projetoTccController.get("/curso/:id_curso", projetoTccService.retornaProjetosTccPorCurso);
projetoTccController.get("/docente/:codigo", projetoTccService.retornaProjetosTccPorDocente);
projetoTccController.post("/", projetoTccService.criaProjetoTcc);
projetoTccController.put("/", projetoTccService.atualizaProjetoTcc);
projetoTccController.delete("/:id", projetoTccService.deletaProjetoTcc);

module.exports = projetoTccController;