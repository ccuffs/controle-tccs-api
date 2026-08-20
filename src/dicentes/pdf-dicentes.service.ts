import { Injectable } from "@nestjs/common";
import * as fs from "fs";
import pdfParse from "pdf-parse";

export interface DicenteExtraidoPdf {
	matricula: number;
	nome: string;
	email: string;
}

interface PdfTextItem {
	str?: string;
	transform?: number[];
}

/** Porta de `processarPDFDicentes` em src/services/dicente-service.js. */
@Injectable()
export class PdfDicentesService {
	async processarPDFDicentes(caminhoArquivo: string): Promise<DicenteExtraidoPdf[]> {
		const dataBuffer = fs.readFileSync(caminhoArquivo);
		const texto = await this.extrairTextoPdf(dataBuffer);
		return this.extrairDicentesDoTexto(texto);
	}

	private async extrairTextoPdf(dataBuffer: Buffer): Promise<string> {
		try {
			const data = await pdfParse(dataBuffer);
			if (data?.text?.trim()) {
				return data.text;
			}
		} catch (error) {
			console.warn(
				"pdf-parse falhou ao ler PDF, tentando pdfjs tolerante:",
				(error as Error).message,
			);
		}

		return this.extrairTextoComPdfjs(dataBuffer);
	}

	/**
	 * Fallback tolerante para PDFs do SIGAA que falham com "bad XRef entry".
	 */
	private async extrairTextoComPdfjs(dataBuffer: Buffer): Promise<string> {
		const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
		const loadingTask = pdfjs.getDocument({
			data: new Uint8Array(dataBuffer),
			stopAtErrors: false,
			verbosity: 0,
			isEvalSupported: false,
			useSystemFonts: true,
		});

		const doc = await loadingTask.promise;
		const paginas: string[] = [];

		for (let pagina = 1; pagina <= doc.numPages; pagina++) {
			const page = await doc.getPage(pagina);
			const content = await page.getTextContent();
			paginas.push(this.montarLinhasDoConteudo(content.items as PdfTextItem[]));
		}

		return paginas.join("\n");
	}

	/** Reconstrói linhas a partir da coordenada Y dos itens de texto. */
	private montarLinhasDoConteudo(items: PdfTextItem[]): string {
		const linhas: { y: number; partes: { x: number; texto: string }[] }[] = [];
		const toleranciaY = 2;

		for (const item of items) {
			const texto = item.str ?? "";
			if (!texto) continue;

			const transform = item.transform ?? [];
			const x = transform[4] ?? 0;
			const y = transform[5] ?? 0;

			let linha = linhas.find((l) => Math.abs(l.y - y) <= toleranciaY);
			if (!linha) {
				linha = { y, partes: [] };
				linhas.push(linha);
			}
			linha.partes.push({ x, texto });
		}

		// PDF: Y cresce de baixo para cima
		linhas.sort((a, b) => b.y - a.y);

		return linhas
			.map((linha) =>
				linha.partes
					.sort((a, b) => a.x - b.x)
					.map((p) => p.texto)
					.join("")
					.trim(),
			)
			.filter(Boolean)
			.join("\n");
	}

	private extrairDicentesDoTexto(texto: string): DicenteExtraidoPdf[] {
		const dicentes: DicenteExtraidoPdf[] = [];
		const vistos = new Set<number>();

		const linhas = texto
			.split("\n")
			.map((linha) => linha.trim())
			.filter((linha) => linha.length > 0);

		// Formato pdf-parse: "NOME" + matrícula; próxima linha = índice numérico
		const regexNomeMatricula = /^([A-ZÁÀÂÃÉÊÍÓÔÕÚÇ\s]+?)(\d{10,})$/;
		// Formato pdfjs/SIGAA: índice + matrícula + "NOME" na mesma linha
		const regexIndiceMatriculaNome = /^(\d{1,3})(\d{10})([A-ZÁÀÂÃÉÊÍÓÔÕÚÇ].+)$/;

		for (let i = 0; i < linhas.length; i++) {
			const linha = linhas[i];

			const matchIndice = linha.match(regexIndiceMatriculaNome);
			if (matchIndice) {
				const matricula = parseInt(matchIndice[2], 10);
				const nome = matchIndice[3].trim();
				if (!vistos.has(matricula) && nome.length > 1) {
					vistos.add(matricula);
					dicentes.push({ matricula, nome, email: "" });
				}
				continue;
			}

			const matchNomeMatricula = linha.match(regexNomeMatricula);
			const proximaLinha = linhas[i + 1] ?? "";
			if (matchNomeMatricula && /^\d+$/.test(proximaLinha)) {
				const matricula = parseInt(matchNomeMatricula[2], 10);
				const nome = matchNomeMatricula[1].trim();
				if (!vistos.has(matricula) && nome.length > 1) {
					vistos.add(matricula);
					dicentes.push({ matricula, nome, email: "" });
				}
			}
		}

		return dicentes;
	}
}
