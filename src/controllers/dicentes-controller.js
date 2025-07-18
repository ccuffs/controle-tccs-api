const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const dicenteService = require("../services/dicente-service");

const dicentesService = express.Router();

// Configuração do multer para upload de PDFs
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		const uploadDir = 'uploads/temp';
		// Cria o diretório se não existir
		if (!fs.existsSync(uploadDir)) {
			fs.mkdirSync(uploadDir, { recursive: true });
		}
		cb(null, uploadDir);
	},
	filename: function (req, file, cb) {
		// Nome único para o arquivo temporário
		const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
		cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
	}
});

const fileFilter = (req, file, cb) => {
	if (file.mimetype === 'application/pdf') {
		cb(null, true);
	} else {
		cb(new Error('Apenas arquivos PDF são permitidos!'), false);
	}
};

const upload = multer({
	storage: storage,
	fileFilter: fileFilter,
	limits: {
		fileSize: 10 * 1024 * 1024 // Limite de 10MB
	}
});

// Rotas existentes
dicentesService.get("/", dicenteService.retornaTodosDicentes);

dicentesService.post("/", dicenteService.criaDicente);

dicentesService.put("/", dicenteService.atualizaDicente);

dicentesService.delete("/:matricula", dicenteService.deletaDicente);

// Nova rota para processar PDF
dicentesService.post("/processar-pdf", upload.single('pdf'), dicenteService.processarEInserirPDFDicentes);

module.exports = dicentesService;