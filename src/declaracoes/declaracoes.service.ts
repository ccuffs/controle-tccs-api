import { HttpException, Injectable } from "@nestjs/common";
import * as fs from "fs/promises";
import * as path from "path";
import { DadosDeclaracao, DeclaracoesRepository, FiltrosDeclaracoes } from "./declaracoes.repository";

function obterNomeMes(numeroMes: number): string {
	const meses = [
		"janeiro", "fevereiro", "março", "abril", "maio", "junho",
		"julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
	];
	return meses[numeroMes] || "mês inválido";
}

function obterDescricaoFase(fase: number): string {
	const fases: Record<number, string> = { 0: "Orientação", 1: "Projeto", 2: "TCC" };
	return fases[fase] || `Fase ${fase}`;
}

async function converterImagemParaBase64(caminhoImagem: string): Promise<string> {
	try {
		const imagemBuffer = await fs.readFile(caminhoImagem);
		const base64 = imagemBuffer.toString("base64");
		const extensao = path.extname(caminhoImagem).toLowerCase();

		let mimeType: string;
		switch (extensao) {
			case ".png":
				mimeType = "image/png";
				break;
			case ".jpg":
			case ".jpeg":
				mimeType = "image/jpeg";
				break;
			case ".gif":
				mimeType = "image/gif";
				break;
			default:
				mimeType = "image/png";
		}

		return `data:${mimeType};base64,${base64}`;
	} catch {
		return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
	}
}

@Injectable()
export class DeclaracoesService {
	constructor(private readonly declaracoesRepository: DeclaracoesRepository) {}

	async listarDeclaracoes(idUsuario: string, filtros: FiltrosDeclaracoes) {
		const [declaracoes, anosDisponiveis, semestresDisponiveis] = await Promise.all([
			this.declaracoesRepository.buscarDeclaracoes(idUsuario, filtros),
			this.declaracoesRepository.buscarAnosDisponiveis(idUsuario),
			this.declaracoesRepository.buscarSemestresDisponiveis(idUsuario),
		]);

		return { declaracoes, anosDisponiveis, semestresDisponiveis, total: declaracoes.length };
	}

	async gerarDeclaracao(idUsuario: string, idTcc: number, tipoParticipacao: string): Promise<string> {
		const dadosDeclaracao = await this.declaracoesRepository.buscarDadosDeclaracao(idUsuario, idTcc, tipoParticipacao);

		if (!dadosDeclaracao) {
			throw new HttpException({ message: "Declaração não encontrada ou usuário não autorizado" }, 404);
		}

		return this.gerarHtmlDeclaracao(dadosDeclaracao);
	}

	async listarDeclaracoesExternas(idUsuario: string, filtros: FiltrosDeclaracoes) {
		const declaracoes = await this.declaracoesRepository.buscarDeclaracoesExternas(idUsuario, filtros);
		return { declaracoes, total: declaracoes.length };
	}

	async gerarDeclaracaoExterno(idUsuario: string, idTcc: number, codigoDocente: string): Promise<string> {
		const dadosDeclaracao = await this.declaracoesRepository.buscarDadosDeclaracaoExterno(idUsuario, idTcc, codigoDocente);

		if (!dadosDeclaracao) {
			throw new HttpException({ message: "Declaração não encontrada ou usuário não autorizado" }, 404);
		}

		return this.gerarHtmlDeclaracao(dadosDeclaracao);
	}

	/** Porta de `gerarHtmlDeclaracao`: preenche o template HTML (o PDF é gerado no
	 * navegador, não aqui — ver `defesas.service.ts` para o mesmo padrão da ata). */
	private async gerarHtmlDeclaracao(dados: DadosDeclaracao): Promise<string> {
		const nomeTemplate = dados.foi_orientador ? "declaracaoorientacoesTCCs.html" : "declaracaobancasTCCs.html";
		const caminhoTemplate = path.join(__dirname, "..", "..", "src", "reports", nomeTemplate);
		const templateHtml = await fs.readFile(caminhoTemplate, "utf8");

		const dataAtual = new Date();
		const dia = dataAtual.getDate();
		const mes = obterNomeMes(dataAtual.getMonth());
		const ano = dataAtual.getFullYear();

		const faseDescricao = obterDescricaoFase(dados.fase);

		const logoBase64 = await converterImagemParaBase64(path.join(__dirname, "..", "..", "src", "reports", "logo.png"));
		const coordenadorBase64 = await converterImagemParaBase64(
			path.join(__dirname, "..", "..", "src", "reports", "coordenador.png"),
		);

		let htmlPreenchido = templateHtml
			.replace(/#docente#/g, dados.nome_docente || "")
			.replace(/SIAPE #numSIAPE#/g, () => {
				if (dados.externo) {
					if (dados.siape_docente) {
						return `SIAPE ${dados.siape_docente}, da Instituição ${dados.instituicao || "Externa"}`;
					}
					return `da Instituição ${dados.instituicao || "Externa"}`;
				}
				return `SIAPE ${dados.siape_docente}`;
			})
			.replace(/#tccFase#/g, faseDescricao)
			.replace(/#nomeAluno#/g, dados.nome_dicente || "")
			.replace(/#anoSemestre#/g, `${dados.ano}/${dados.semestre}`)
			.replace(/#tituloTcc#/g, dados.titulo_tcc)
			.replace(/#nomeCoordenador#/g, dados.nome_coordenador || "")
			.replace(/#nomeCurso#/g, dados.nome_curso || "")
			.replace(/#numSIAPECoordenador#/g, String(dados.siape_coordenador ?? ""))
			.replace(/#diaem#/g, String(dia))
			.replace(/#mesem#/g, mes)
			.replace(/#anoem#/g, String(ano))
			.replace(/src="logo\.png"/g, `src="${logoBase64}"`)
			.replace(/src="coordenador\.png"/g, `src="${coordenadorBase64}"`)
			.replace(/src="images\/image2\.png"/g, 'style="display: none;"');

		if (!dados.foi_orientador) {
			let dataDefesa = "data a ser definida";
			let horaDefesa = "horário a definir";

			if (dados.data_defesa) {
				const iso = new Date(dados.data_defesa).toISOString();
				const [anoDef, mesDef, diaDef] = iso.split("T")[0].split("-");
				dataDefesa = `${diaDef}/${mesDef}/${anoDef}`;
				horaDefesa = `${iso.slice(11, 13)}h${iso.slice(14, 16)}`;
			}

			htmlPreenchido = htmlPreenchido.replace(/#dataDefesa#/g, dataDefesa).replace(/#horaDefesa#/g, horaDefesa);
		}

		return htmlPreenchido;
	}
}
