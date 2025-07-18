const express = require("express");
const dicenteService = require("../services/dicente-service");
const dicentesService = express.Router();

dicentesService.get("/", dicenteService.retornaTodosDicentes);

dicentesService.post("/", dicenteService.criaDicente);

dicentesService.put("/", dicenteService.atualizaDicente);

dicentesService.delete("/:matricula", dicenteService.deletaDicente);

module.exports = dicentesService;