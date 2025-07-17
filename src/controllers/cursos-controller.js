const express = require("express");
const cursoService = require("../services/curso-service");
const cursosService = express.Router();

cursosService.get("/", cursoService.retornaTodosCursos);

cursosService.post("/", cursoService.criaCurso);

cursosService.put("/", cursoService.atualizaCurso);

cursosService.delete("/:id", cursoService.deletaCurso);

module.exports = cursosService;
