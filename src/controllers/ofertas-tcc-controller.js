const express = require("express");
const ofertaTccService = require("../services/ofertas-tcc-service");
const ofertasTccService = express.Router();

ofertasTccService.get("/", ofertaTccService.retornaTodasOfertasTcc);

module.exports = ofertasTccService;
