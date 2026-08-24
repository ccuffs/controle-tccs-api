import { HttpException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import * as fs from "fs/promises";
import * as path from "path";
import { DefesaEntity, OrientacaoEntity } from "../database/entities";
import { DocentesRepository } from "../docentes/docentes.repository";
import { AdicionarMembroExternoDto } from "./dto/membro-externo.dto";
import { AgendarDefesaDto } from "./dto/agendar-defesa.dto";
import { AtualizarDefesaDto } from "./dto/atualizar-defesa.dto";
import { CriarDefesaDto } from "./dto/criar-defesa.dto";
import { GerenciarBancaDto } from "./dto/gerenciar-banca.dto";
import { DefesasRepository, FiltrosDefesas, HorariosAdjacentes } from "./defesas.repository";

/** Porta dos horários auxiliares de src/services/defesa-service.js. Grade de horários
 * das bancas vai de 13:30 a 21:30 em intervalos de 30 minutos. */
function calcularHorarioAnterior(hora: string): string | null {
	const [horas, minutos] = hora.split(":").map(Number);
	let horaAnterior = horas;
	let minutoAnterior = minutos - 30;

	if (minutoAnterior < 0) {
		minutoAnterior = 30;
		horaAnterior -= 1;
	}

	if (horaAnterior < 13 || (horaAnterior === 13 && minutoAnterior < 30)) {
		return null;
	}

	return `${horaAnterior.toString().padStart(2, "0")}:${minutoAnterior.toString().padStart(2, "0")}:00`;
}

function calcularHorarioPosterior(hora: string): string | null {
	const [horas, minutos] = hora.split(":").map(Number);
	let proximaHora = horas;
	let proximoMinuto = minutos + 30;

	if (proximoMinuto >= 60) {
		proximoMinuto = 0;
		proximaHora += 1;
	}

	if (proximaHora > 21 || (proximaHora === 21 && proximoMinuto > 30)) {
		return null;
	}

	return `${proximaHora.toString().padStart(2, "0")}:${proximoMinuto.toString().padStart(2, "0")}:00`;
}

function calcularHorarios(hora: string): HorariosAdjacentes {
	return { horaAnterior: calcularHorarioAnterior(hora), horaPosterior: calcularHorarioPosterior(hora) };
}

async function converterImagemBase64(caminhoImagem: string): Promise<string> {
	try {
		const buf = await fs.readFile(caminhoImagem);
		const ext = path.extname(caminhoImagem).toLowerCase();
		const mime = ext === ".jpg" || ext === ".jpeg" ? "image/jpeg" : "image/png";
		return `data:${mime};base64,${buf.toString("base64")}`;
	} catch {
		return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
	}
}

function gerarHtmlBancaMembro(defesa: DefesaEntity, isPresidente: boolean): string {
	const docente = defesa.membroBanca!;
	const titulo = isPresidente ? "Presidente (orientador(a)):" : "Membro:";

	const instituicao = docente.externo && docente.instituicao ? docente.instituicao : "Universidade Federal da Fronteira Sul";

	const avaliacaoTexto = defesa.avaliacao != null ? String(defesa.avaliacao).replace(".", ",") : "_______";

	return `
	<table class="membro">
		<colgroup>
			<col class="col-info">
			<col class="col-assinatura">
		</colgroup>
		<tr>
			<td colspan="2" class="role">${titulo} ${docente.nome}</td>
		</tr>
		<tr class="dados-membro">
			<td class="info-membro">
				<p>Email: ${docente.email || "___________________________"}</p>
				<p>Institui&ccedil;&atilde;o: ${instituicao}</p>
				<p>Avalia&ccedil;&atilde;o: ${avaliacaoTexto}</p>
			</td>
			<td class="sig-banca">
				<span></span>
				<small>Assinatura</small>
			</td>
		</tr>
	</table>`;
}

@Injectable()
export class DefesasService {
	constructor(
		private readonly defesasRepository: DefesasRepository,
		private readonly docentesRepository: DocentesRepository,
		@InjectModel(OrientacaoEntity)
		private readonly orientacaoModel: typeof OrientacaoEntity,
	) {}

	obterTodasDefesas(filtros: FiltrosDefesas): Promise<DefesaEntity[]> {
		return this.defesasRepository.obterTodasDefesas(filtros);
	}

	obterDefesasPorTcc(idTcc: number): Promise<DefesaEntity[]> {
		return this.defesasRepository.obterDefesasPorTcc(idTcc);
	}

	async criarDefesa(formData: CriarDefesaDto): Promise<void> {
		if (!formData.membro_banca) {
			throw new HttpException({ message: "É necessário informar um membro da banca" }, 400);
		}

		const defesaExiste = await this.defesasRepository.verificarDefesaExiste(formData.id_tcc, formData.membro_banca);

		if (defesaExiste) {
			throw new HttpException(
				{ message: "Já existe uma defesa agendada para este TCC com este membro da banca" },
				400,
			);
		}

		await this.defesasRepository.criarDefesa(formData);
	}

	async atualizarDefesa(idTcc: number, membroBanca: string, formData: AtualizarDefesaDto): Promise<boolean> {
		const fase = formData.fase ?? null;
		return this.defesasRepository.atualizarDefesa(idTcc, membroBanca, formData as unknown as Partial<DefesaEntity>, fase);
	}

	registrarAvaliacaoDefesa(idTcc: number, avaliacao: number): Promise<boolean> {
		return this.defesasRepository.registrarAvaliacaoDefesa(idTcc, avaliacao);
	}

	async deletarDefesa(idTcc: number, membroBanca: string, fase: number) {
		return this.defesasRepository.deletarDefesaComRestauracao(idTcc, membroBanca, fase, calcularHorarios);
	}

	async gerenciarBancaDefesa(dados: GerenciarBancaDto) {
		if (!dados.id_tcc || !dados.fase || !Array.isArray(dados.membros_novos) || !Array.isArray(dados.membros_existentes)) {
			throw new HttpException({ message: "Parâmetros inválidos" }, 400);
		}

		return this.defesasRepository.gerenciarBancaDefesa({
			id_tcc: dados.id_tcc,
			fase: dados.fase,
			membros_novos: dados.membros_novos,
			membros_existentes: dados.membros_existentes,
			convites_banca_existentes: dados.convites_banca_existentes,
			orientador_codigo: dados.orientador_codigo,
			data_hora_defesa: dados.data_hora_defesa,
			alteracoes: dados.alteracoes,
		});
	}

	async agendarDefesa(dados: AgendarDefesaDto) {
		if (
			!dados.id_tcc ||
			!dados.fase ||
			!dados.data ||
			!dados.hora ||
			!dados.codigo_orientador ||
			!Array.isArray(dados.membros_banca) ||
			dados.membros_banca.length !== 2
		) {
			throw new HttpException({ message: "Parâmetros inválidos" }, 400);
		}

		return this.defesasRepository.agendarDefesa(
			{
				id_tcc: dados.id_tcc,
				fase: dados.fase,
				data: dados.data,
				hora: dados.hora,
				codigo_orientador: dados.codigo_orientador,
				membros_banca: dados.membros_banca as [string, string],
			},
			calcularHorarios,
		);
	}

	async adicionarMembroExterno(idUsuario: string, dados: AdicionarMembroExternoDto) {
		if (!dados.id_tcc || dados.fase === undefined || !dados.docente) {
			throw new HttpException({ message: "Parâmetros obrigatórios ausentes" }, 400);
		}

		const docenteLogado = await this.docentesRepository.obterDocentePorUsuario(idUsuario);

		if (!docenteLogado) {
			throw new HttpException({ message: "Docente não encontrado para o usuário logado" }, 403);
		}

		const orientacaoExiste = await this.orientacaoModel.findOne({
			where: { id_tcc: dados.id_tcc, codigo_docente: docenteLogado.codigo, orientador: true },
		});

		if (!orientacaoExiste) {
			throw new HttpException({ message: "Apenas o orientador do TCC pode adicionar membros externos" }, 403);
		}

		let codigoDocente = dados.docente.codigo;

		if (!codigoDocente) {
			let docenteExterno = await this.docentesRepository.obterDocentePorEmail(dados.docente.email!);

			if (!docenteExterno) {
				const codigoBase = dados.docente
					.email!.split("@")[0]
					.replace(/[^a-zA-Z0-9]/g, "-")
					.toLowerCase();
				const codigoGerado = `ext-${codigoBase}-${Date.now().toString(36)}`;

				docenteExterno = await this.docentesRepository.criarDocente({
					codigo: codigoGerado,
					nome: dados.docente.nome,
					email: dados.docente.email,
					siape: dados.docente.siape ?? undefined,
					externo: true,
					instituicao: dados.docente.instituicao,
				});
			}

			codigoDocente = docenteExterno.codigo;
		}

		const resultado = await this.defesasRepository.adicionarMembroExterno({
			id_tcc: dados.id_tcc,
			fase: dados.fase,
			codigo_docente: codigoDocente,
			data_hora_defesa: dados.data_hora_defesa,
		});

		if (!resultado.sucesso) {
			throw new HttpException({ message: resultado.motivo }, 400);
		}

		return { codigo_docente: codigoDocente };
	}

	async listarMembrosExternosTcc(idTcc: number) {
		const defesas = await this.defesasRepository.listarMembrosExternosTcc(idTcc);

		return defesas.map((d) => ({
			codigo: d.membroBanca!.codigo,
			nome: d.membroBanca!.nome,
			email: d.membroBanca!.email,
			siape: d.membroBanca!.siape,
			instituicao: d.membroBanca!.instituicao,
			fase: d.fase,
			data_defesa: d.data_defesa,
			avaliacao: d.avaliacao,
		}));
	}

	async removerMembroExterno(idUsuario: string, idTcc: number, codigoDocente: string, fase: number): Promise<void> {
		const docenteLogado = await this.docentesRepository.obterDocentePorUsuario(idUsuario);

		if (!docenteLogado) {
			throw new HttpException({ message: "Docente não encontrado para o usuário logado" }, 403);
		}

		const orientacaoExiste = await this.orientacaoModel.findOne({
			where: { id_tcc: idTcc, codigo_docente: docenteLogado.codigo, orientador: true },
		});

		if (!orientacaoExiste) {
			throw new HttpException({ message: "Apenas o orientador do TCC pode remover membros externos" }, 403);
		}

		const sucesso = await this.defesasRepository.removerMembroExterno(idTcc, codigoDocente, fase);

		if (!sucesso) {
			throw new HttpException({ message: "Membro externo não encontrado nesta banca" }, 404);
		}
	}

	/** Porta de `gerarAtaDefesa`: monta o HTML da ata substituindo placeholders no
	 * template `src/reports/ataBancaTCC.html` (o PDF é gerado no navegador, não aqui). */
	async gerarAtaDefesa(idTcc: number, fase: number, local: string): Promise<string> {
		const dados = await this.defesasRepository.buscarDadosAta(idTcc, fase);

		if (!dados) {
			throw new HttpException({ message: "Defesa não encontrada" }, 404);
		}

		const { defesas, coOrientacao, tcc } = dados;

		const templatePath = path.join(__dirname, "..", "..", "src", "reports", "ataBancaTCC.html");
		let html = await fs.readFile(templatePath, "utf8");

		const logoBase64 = await converterImagemBase64(path.join(__dirname, "..", "..", "src", "reports", "logo.png"));
		html = html.replace(/src="logo\.png"/g, `src="${logoBase64}"`);

		const dicente = tcc.dicente;
		const curso = tcc.curso;
		const faseLabel = Number(fase) === 1 ? "I" : "II";

		const defesaOrientador = defesas.find((d) => d.orientador);
		const orientadorNome = defesaOrientador?.membroBanca?.nome || "___________________________";
		const siapeOrientador = defesaOrientador?.membroBanca?.siape;

		const membrosNaoOrientadores = defesas.filter((d) => !d.orientador);
		let bancaHtml = "";
		if (defesaOrientador) {
			bancaHtml += gerarHtmlBancaMembro(defesaOrientador, true);
		}
		for (const d of membrosNaoOrientadores) {
			bancaHtml += gerarHtmlBancaMembro(d, false);
		}

		const coOrientadorNome = coOrientacao?.docente?.nome || "_______________________________________";
		const coOrientadorInstituicao =
			coOrientacao?.docente?.externo && coOrientacao?.docente?.instituicao
				? coOrientacao.docente.instituicao
				: coOrientacao
					? "Universidade Federal da Fronteira Sul"
					: "_____________________________________________";

		const totalMembros = defesas.length;
		const avaliacoes = defesas.map((d) => d.avaliacao).filter((a): a is number => a != null);
		const todasPreenchidas = avaliacoes.length === totalMembros && totalMembros > 0;
		const mediaNum = todasPreenchidas ? avaliacoes.reduce((s, v) => s + Number(v), 0) / avaliacoes.length : null;
		const mediaFinal = mediaNum !== null ? mediaNum.toFixed(1).replace(".", ",") : "___________";

		const aprovadoExplicito = Number(fase) === 2 ? tcc.aprovado_tcc : tcc.aprovado_projeto;
		let checkAprovado = "";
		let checkReprovado = "";

		if (aprovadoExplicito === true) {
			checkAprovado = "X";
		} else if (todasPreenchidas && mediaNum !== null) {
			if (mediaNum >= 6) {
				checkAprovado = "X";
			} else {
				checkReprovado = "X";
			}
		}

		let dataDefesaStr = "___/___/______";
		let horaDefesaStr = "___h___";
		const dataDefesaRaw = defesaOrientador?.data_defesa || defesas[0]?.data_defesa;
		if (dataDefesaRaw) {
			const iso = new Date(dataDefesaRaw).toISOString();
			const [ano, mes, dia] = iso.split("T")[0].split("-");
			dataDefesaStr = `${dia}/${mes}/${ano}`;
			horaDefesaStr = `${iso.slice(11, 13)}h${iso.slice(14, 16)}`;
		}

		const comentariosTcc = tcc.comentarios_tcc?.trim() || "";
		const parecerConteudo = comentariosTcc
			? `<p style="margin:4px 0; white-space:pre-wrap; line-height:1.6;">${comentariosTcc}</p>`
			: `<span class="linha"></span><span class="linha"></span><span class="linha"></span>`;

		html = html
			.replace(/#nomeCurso#/g, curso?.nome || "Ciência da Computação")
			.replace(/#tccFase#/g, faseLabel)
			.replace(/#nomeAluno#/g, dicente?.nome || "___________________________")
			.replace(/#matriculaAluno#/g, String(dicente?.matricula ?? "___________________________"))
			.replace(/#titulo#/g, tcc.titulo || "___________________________")
			.replace(/#orientador#/g, orientadorNome)
			.replace(/#siapeOrientador#/g, siapeOrientador ? String(siapeOrientador) : "___________________________")
			.replace(/#coOrientador#/g, coOrientadorNome)
			.replace(/#coOrientadorInstituicao#/g, coOrientadorInstituicao)
			.replace(/#bancaHtml#/g, bancaHtml)
			.replace(/#checkMencaoHonrosa#/g, "")
			.replace(/#checkAprovado#/g, checkAprovado)
			.replace(/#checkAprovadoCondicionalmente#/g, "")
			.replace(/#checkReprovado#/g, checkReprovado)
			.replace(/#mediaFinal#/g, mediaFinal)
			.replace(/#dataDefesa#/g, dataDefesaStr)
			.replace(/#horaDefesa#/g, horaDefesaStr)
			.replace(/#local#/g, local)
			.replace(/#parecerConteudo#/g, parecerConteudo);

		return html;
	}
}
