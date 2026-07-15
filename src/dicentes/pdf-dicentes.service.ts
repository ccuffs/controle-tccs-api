import { Injectable } from "@nestjs/common";
import * as fs from "fs";
import pdfParse from "pdf-parse";

export interface DicenteExtraidoPdf {
	matricula: number;
	nome: string;
	email: string;
}

/** Porta de `processarPDFDicentes` em src/services/dicente-service.js. */
@Injectable()
export class PdfDicentesService {
	async processarPDFDicentes(caminhoArquivo: string): Promise<DicenteExtraidoPdf[]> {
		const dataBuffer = fs.readFileSync(caminhoArquivo);
		const data = await pdfParse(dataBuffer);

		const texto = data.text;
		const dicentes: DicenteExtraidoPdf[] = [];

		const linhas = texto
			.split("\n")
			.map((linha) => linha.trim())
			.filter((linha) => linha.length > 0);

		// Procura por padrões: NOME seguido de números (matrícula) e depois um número simples na próxima linha.
		for (let i = 0; i < linhas.length - 1; i++) {
			const linha = linhas[i];
			const proximaLinha = linhas[i + 1];

			const regexNomeMatricula = /^([A-ZÁÀÂÃÉÊÍÓÔÕÚÇ\s]+?)(\d{10,})$/;
			const matchNomeMatricula = linha.match(regexNomeMatricula);

			const regexId = /^\d+$/;
			const matchId = proximaLinha.match(regexId);

			if (matchNomeMatricula && matchId) {
				const [, nome, matricula] = matchNomeMatricula;
				dicentes.push({
					matricula: parseInt(matricula, 10),
					nome: nome.trim(),
					email: "",
				});
			}
		}

		return dicentes;
	}
}
