const express = require("express");
const docenteService = require("../services/docentes-service");
const docentesService = express.Router();

docentesService.get("/", docenteService.retornaTodosDocentes);

docentesService.post("/", docenteService.criaDocente);

docentesService.put("/", docenteService.atualizaDocente);

docentesService.delete("/:codigo", docenteService.deletaDocente);

module.exports = docentesService;
