const defesaRepository = require("../repository/defesa-repository");
const fs = require("fs").promises;
const path = require("path");

// Função auxiliar para calcular o horário anterior
const calcularHorarioAnterior = (hora) => {
	const [horas, minutos, segundos] = hora.split(":").map(Number);
	let horaAnterior = horas;
	let minutoAnterior = minutos - 30;

	if (minutoAnterior < 0) {
		minutoAnterior = 30;
		horaAnterior -= 1;
	}

	// Se for antes das 13:30, retornar null (não há horário anterior)
	if (horaAnterior < 13 || (horaAnterior === 13 && minutoAnterior < 30)) {
		return null;
	}

	return `${horaAnterior.toString().padStart(2, "0")}:${minutoAnterior.toString().padStart(2, "0")}:00`;
};

// Função auxiliar para calcular o próximo horário
const calcularHorarioPosterior = (hora) => {
	const [horas, minutos, segundos] = hora.split(":").map(Number);
	let proximaHora = horas;
	let proximoMinuto = minutos + 30;

	if (proximoMinuto >= 60) {
		proximoMinuto = 0;
		proximaHora += 1;
	}

	// Se passar das 21:30, retornar null (não há próximo horário)
	if (proximaHora > 21 || (proximaHora === 21 && proximoMinuto > 30)) {
		return null;
	}

	return `${proximaHora.toString().padStart(2, "0")}:${proximoMinuto.toString().padStart(2, "0")}:00`;
};

// Função auxiliar para calcular ambos os horários
const calcularHorarios = (hora) => {
	return {
		horaAnterior: calcularHorarioAnterior(hora),
		horaPosterior: calcularHorarioPosterior(hora),
	};
};

// Função para retornar todas as defesas
const retornaTodasDefesas = async (req, res) => {
	try {
		const { id_tcc, ano, semestre } = req.query;
		const filtros = { id_tcc, ano, semestre };

		const defesas = await defesaRepository.obterTodasDefesas(filtros);
		res.status(200).json({ defesas: defesas });
	} catch (error) {
		console.log("Erro ao buscar defesas:", error);
		res.status(500).json({ message: "Erro ao buscar defesas" });
	}
};

// Função para buscar defesas específicas por ID do TCC
const retornaDefesasPorTcc = async (req, res) => {
	try {
		const { id_tcc } = req.params;

		const defesas = await defesaRepository.obterDefesasPorTcc(id_tcc);

		// Retorna array vazio se não houver defesas ao invés de erro 404
		res.status(200).json({ defesas: defesas || [] });
	} catch (error) {
		console.log("Erro ao buscar defesas:", error);
		res.status(500).json({ message: "Erro ao buscar defesas" });
	}
};

// Função para criar uma nova defesa
const criaDefesa = async (req, res) => {
	const formData = req.body.formData;

	try {
		// Verificar se foi fornecido um membro da banca
		if (!formData.membro_banca) {
			return res.status(400).json({
				message: "É necessário informar um membro da banca",
			});
		}

		// Verificar se já existe defesa para este TCC com este membro da banca
		const defesaExiste = await defesaRepository.verificarDefesaExiste(
			formData.id_tcc,
			formData.membro_banca,
		);

		if (defesaExiste) {
			return res.status(400).json({
				message:
					"Já existe uma defesa agendada para este TCC com este membro da banca",
			});
		}

		const defesa = await defesaRepository.criarDefesa(formData);

		res.status(201).json({
			message: "Defesa criada com sucesso",
		});
	} catch (error) {
		console.log("Erro ao criar defesa:", error);
		console.log("Dados que causaram erro:", formData);
		res.status(500).json({ message: "Erro ao criar defesa" });
	}
};

// Função para atualizar uma defesa
const atualizaDefesa = async (req, res) => {
	const { id_tcc, membro_banca } = req.params;
	const formData = req.body.formData;

	try {
		// Extrair fase do formData se presente
		const fase = formData.fase;

		const sucesso = await defesaRepository.atualizarDefesa(
			id_tcc,
			membro_banca,
			formData,
			fase,
		);

		if (sucesso) {
			res.status(200).json({ message: "Defesa atualizada com sucesso" });
		} else {
			res.status(404).json({ message: "Defesa não encontrada" });
		}
	} catch (error) {
		console.log("Erro ao atualizar defesa:", error);
		console.log("Dados que causaram erro:", formData);
		res.status(500).json({ message: "Erro ao atualizar defesa" });
	}
};

// Função para registrar avaliação da defesa
const registraAvaliacaoDefesa = async (req, res) => {
	const { id_tcc } = req.params;
	const { avaliacao } = req.body;

	try {
		const sucesso = await defesaRepository.registrarAvaliacaoDefesa(
			id_tcc,
			avaliacao,
		);

		if (sucesso) {
			res.status(200).json({
				message: "Avaliação registrada com sucesso",
			});
		} else {
			res.status(404).json({ message: "Defesa não encontrada" });
		}
	} catch (error) {
		console.log("Erro ao registrar avaliação:", error);
		res.status(500).json({ message: "Erro ao registrar avaliação" });
	}
};

// Função para deletar uma defesa
const deletaDefesa = async (req, res) => {
	try {
		const { id_tcc, membro_banca, fase } = req.params;

		const resultado = await defesaRepository.deletarDefesaComRestauracao(
			id_tcc,
			membro_banca,
			fase,
			calcularHorarios,
		);

		if (resultado.sucesso) {
			res.status(200).json({
				message: "Defesa deletada com sucesso",
				disponibilidadesRestauradas:
					resultado.disponibilidadesRestauradas,
			});
		} else {
			res.status(404).json({ message: resultado.motivo });
		}
	} catch (error) {
		console.error("Erro ao deletar defesa:", error);
		res.status(500).json({ message: "Erro ao deletar defesa" });
	}
};

// Função para gerenciar banca de defesa com convites em transação única
const gerenciarBancaDefesa = async (req, res) => {
	try {
		const {
			id_tcc,
			fase,
			membros_novos,
			membros_existentes,
			convites_banca_existentes,
			orientador_codigo,
			data_hora_defesa,
			alteracoes,
		} = req.body;

		if (
			!id_tcc ||
			!fase ||
			!Array.isArray(membros_novos) ||
			!Array.isArray(membros_existentes)
		) {
			return res.status(400).json({ message: "Parâmetros inválidos" });
		}

		const resultado = await defesaRepository.gerenciarBancaDefesa({
			id_tcc,
			fase,
			membros_novos,
			membros_existentes,
			convites_banca_existentes,
			orientador_codigo,
			data_hora_defesa,
			alteracoes,
		});

		if (resultado.sucesso) {
			res.status(200).json({
				message: "Banca de defesa gerenciada com sucesso",
				membros_adicionados: resultado.membros_adicionados,
				membros_removidos: resultado.membros_removidos,
				orientador_incluido: resultado.orientador_incluido,
				data_defesa_atualizada: resultado.data_defesa_atualizada,
			});
		} else {
			res.status(400).json({
				message: "Erro ao gerenciar banca de defesa",
			});
		}
	} catch (error) {
		console.error("Erro ao gerenciar banca de defesa:", error);
		res.status(500).json({
			message: "Erro interno do servidor",
		});
	}
};

// Função para agendar uma defesa
const agendarDefesa = async (req, res) => {
	try {
		const { id_tcc, fase, data, hora, codigo_orientador, membros_banca } =
			req.body;

		if (
			!id_tcc ||
			!fase ||
			!data ||
			!hora ||
			!codigo_orientador ||
			!Array.isArray(membros_banca) ||
			membros_banca.length !== 2
		) {
			return res.status(400).json({ message: "Parâmetros inválidos" });
		}

		const resultado = await defesaRepository.agendarDefesa(
			{
				id_tcc,
				fase,
				data,
				hora,
				codigo_orientador,
				membros_banca,
			},
			calcularHorarios,
		);

		if (resultado.sucesso) {
			return res.status(201).json({
				message: "Defesa agendada com sucesso",
				horarioAnteriorRemovido: resultado.horarioAnteriorRemovido,
				horarioPosteriorRemovido: resultado.horarioPosteriorRemovido,
			});
		} else {
			return res.status(400).json({ message: "Erro ao agendar defesa" });
		}
	} catch (error) {
		console.error("Erro ao agendar defesa:", error);
		return res.status(500).json({
			message: "Erro ao agendar defesa",
		});
	}
};

// Adicionar membro externo à banca
const adicionarMembroExterno = async (req, res) => {
	try {
		const idUsuario = req.usuario?.id;

		if (!idUsuario) {
			return res.status(401).json({ message: "Usuário não autenticado" });
		}

		const { id_tcc, fase, data_hora_defesa, docente: dadosDocente } = req.body;

		if (!id_tcc || fase === undefined || !dadosDocente) {
			return res.status(400).json({ message: "Parâmetros obrigatórios ausentes" });
		}

		// Verificar se o usuário logado é o orientador deste TCC
		const docenteRepository = require("../repository/docente-repository");
		const docenteLogado = await docenteRepository.obterDocentePorUsuario(idUsuario);

		if (!docenteLogado) {
			return res.status(403).json({ message: "Docente não encontrado para o usuário logado" });
		}

		const model = require("../models");
		const orientacaoExiste = await model.Orientacao.findOne({
			where: { id_tcc, codigo_docente: docenteLogado.codigo, orientador: true },
		});

		if (!orientacaoExiste) {
			return res.status(403).json({ message: "Apenas o orientador do TCC pode adicionar membros externos" });
		}

		// Criar ou reutilizar docente externo
		let codigoDocente = dadosDocente.codigo;

		if (!codigoDocente) {
			// Buscar por email se não tiver código
			let docenteExterno = await docenteRepository.obterDocentePorEmail(dadosDocente.email);

			if (!docenteExterno) {
				// Gerar código único para externo
				const codigoBase = dadosDocente.email.split("@")[0].replace(/[^a-zA-Z0-9]/g, "-").toLowerCase();
				const codigoGerado = `ext-${codigoBase}-${Date.now().toString(36)}`;

				docenteExterno = await docenteRepository.criarDocente({
					codigo: codigoGerado,
					nome: dadosDocente.nome,
					email: dadosDocente.email,
					siape: dadosDocente.siape || null,
					externo: true,
					instituicao: dadosDocente.instituicao,
				});
			}

			codigoDocente = docenteExterno.codigo;
		}

		const resultado = await defesaRepository.adicionarMembroExterno({
			id_tcc,
			fase,
			codigo_docente: codigoDocente,
			data_hora_defesa,
		});

		if (resultado.sucesso) {
			return res.status(201).json({
				message: "Membro externo adicionado à banca com sucesso",
				codigo_docente: codigoDocente,
			});
		} else {
			return res.status(400).json({ message: resultado.motivo });
		}
	} catch (error) {
		console.error("Erro ao adicionar membro externo:", error);
		return res.status(500).json({ message: "Erro interno do servidor" });
	}
};

// Listar membros externos de um TCC
const listarMembrosExternosTcc = async (req, res) => {
	try {
		const { id_tcc } = req.params;

		const defesas = await defesaRepository.listarMembrosExternosTcc(id_tcc);

		const membros = defesas.map((d) => ({
			codigo: d.membroBanca.codigo,
			nome: d.membroBanca.nome,
			email: d.membroBanca.email,
			siape: d.membroBanca.siape,
			instituicao: d.membroBanca.instituicao,
			fase: d.fase,
			data_defesa: d.data_defesa,
			avaliacao: d.avaliacao,
		}));

		return res.status(200).json({ membros });
	} catch (error) {
		console.error("Erro ao listar membros externos:", error);
		return res.status(500).json({ message: "Erro ao listar membros externos" });
	}
};

// Remover membro externo da banca
const removerMembroExterno = async (req, res) => {
	try {
		const idUsuario = req.usuario?.id;
		const { id_tcc, codigo_docente, fase } = req.params;

		// Verificar se o usuário logado é o orientador deste TCC
		const docenteRepository = require("../repository/docente-repository");
		const docenteLogado = await docenteRepository.obterDocentePorUsuario(idUsuario);

		if (!docenteLogado) {
			return res.status(403).json({ message: "Docente não encontrado para o usuário logado" });
		}

		const model = require("../models");
		const orientacaoExiste = await model.Orientacao.findOne({
			where: { id_tcc, codigo_docente: docenteLogado.codigo, orientador: true },
		});

		if (!orientacaoExiste) {
			return res.status(403).json({ message: "Apenas o orientador do TCC pode remover membros externos" });
		}

		const sucesso = await defesaRepository.removerMembroExterno(id_tcc, codigo_docente, fase);

		if (sucesso) {
			return res.status(200).json({ message: "Membro externo removido da banca com sucesso" });
		} else {
			return res.status(404).json({ message: "Membro externo não encontrado nesta banca" });
		}
	} catch (error) {
		console.error("Erro ao remover membro externo:", error);
		return res.status(500).json({ message: "Erro interno do servidor" });
	}
};

// ─── Geração da Ata de Defesa ────────────────────────────────────────────────

const _obterNomeMes = (numeroMes) => {
	const meses = [
		"janeiro", "fevereiro", "março", "abril", "maio", "junho",
		"julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
	];
	return meses[numeroMes] || "mês inválido";
};

const _converterImagemBase64 = async (caminhoImagem) => {
	try {
		const buf = await fs.readFile(caminhoImagem);
		const ext = path.extname(caminhoImagem).toLowerCase();
		const mime = ext === ".jpg" || ext === ".jpeg" ? "image/jpeg" : "image/png";
		return `data:${mime};base64,${buf.toString("base64")}`;
	} catch {
		return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
	}
};

const _gerarHtmlBancaMembro = (defesa, isPresidente) => {
	const docente = defesa.membroBanca;
	const titulo = isPresidente ? "Presidente (orientador(a)):" : "Membro:";

	const instituicao = docente.externo && docente.instituicao
		? docente.instituicao
		: "Universidade Federal da Fronteira Sul";

	const avaliacaoTexto = defesa.avaliacao != null
		? String(defesa.avaliacao).replace(".", ",")
		: "_______";

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
};

const gerarAtaDefesa = async (req, res) => {
	try {
		const { id_tcc, fase } = req.params;
		const local = req.query.local || "";

		const dados = await defesaRepository.buscarDadosAta(parseInt(id_tcc), parseInt(fase));

		if (!dados) {
			return res.status(404).json({ message: "Defesa não encontrada" });
		}

		const { defesas, coOrientacao, tcc } = dados;

		// Ler template
		const templatePath = path.join(__dirname, "..", "reports", "ataBancaTCC.html");
		let html = await fs.readFile(templatePath, "utf8");

		// Logo base64
		const logoBase64 = await _converterImagemBase64(
			path.join(__dirname, "..", "reports", "logo.png"),
		);
		html = html.replace(/src="logo\.png"/g, `src="${logoBase64}"`);

		// Dados do TCC
		const dicente = tcc.Dicente;
		const curso = tcc.Curso;
		const faseLabel = fase === "1" || fase === 1 ? "I" : "II";

		// Orientador (linha com orientador: true)
		const defesaOrientador = defesas.find((d) => d.orientador);
		const orientadorNome = defesaOrientador?.membroBanca?.nome || "___________________________";
		const siapeOrientador = defesaOrientador?.membroBanca?.siape;

		// Membros (orientador primeiro, demais em seguida)
		const membrosNaoOrientadores = defesas.filter((d) => !d.orientador);
		let bancaHtml = "";
		if (defesaOrientador) {
			bancaHtml += _gerarHtmlBancaMembro(defesaOrientador, true);
		}
		for (const d of membrosNaoOrientadores) {
			bancaHtml += _gerarHtmlBancaMembro(d, false);
		}

		// Co-orientador
		const coOrientadorNome = coOrientacao?.Docente?.nome || "_______________________________________";
		const coOrientadorInstituicao = coOrientacao?.Docente?.externo && coOrientacao?.Docente?.instituicao
			? coOrientacao.Docente.instituicao
			: coOrientacao
				? "Universidade Federal da Fronteira Sul"
				: "_____________________________________________";

		// Média das notas salvas
		const totalMembros = defesas.length;
		const avaliacoes = defesas.map((d) => d.avaliacao).filter((a) => a != null);
		const todasPreenchidas = avaliacoes.length === totalMembros && totalMembros > 0;
		const mediaNum = todasPreenchidas
			? avaliacoes.reduce((s, v) => s + parseFloat(v), 0) / avaliacoes.length
			: null;
		const mediaFinal = mediaNum !== null
			? mediaNum.toFixed(1).replace(".", ",")
			: "___________";

		// Resultado:
		// aprovado_tcc e aprovado_projeto têm defaultValue: false no banco,
		// portanto false NÃO significa reprovação — apenas "ainda não aprovado".
		// Apenas true indica aprovação explícita pelo orientador.
		// Reprovação só é determinada quando todas as notas estão preenchidas e média < 6.
		const aprovadoExplicito = (fase === "2" || fase === 2) ? tcc.aprovado_tcc : tcc.aprovado_projeto;
		let checkAprovado = "";
		let checkReprovado = "";

		if (aprovadoExplicito === true) {
			// Aprovação explícita registrada pelo orientador
			checkAprovado = "X";
		} else if (todasPreenchidas && mediaNum !== null) {
			// Sem aprovação explícita: deriva exclusivamente da média
			if (mediaNum >= 6) {
				checkAprovado = "X";
			} else {
				checkReprovado = "X";
			}
		}
		// Se aprovadoExplicito é false (padrão do banco) e notas incompletas: deixa em branco

		// Data/hora da defesa
		let dataDefesaStr = "___/___/______";
		let horaDefesaStr = "___h___";
		const dataDefesaRaw = defesaOrientador?.data_defesa || defesas[0]?.data_defesa;
		if (dataDefesaRaw) {
			const iso = new Date(dataDefesaRaw).toISOString();
			const [ano, mes, dia] = iso.split("T")[0].split("-");
			dataDefesaStr = `${dia}/${mes}/${ano}`;
			horaDefesaStr = `${iso.slice(11, 13)}h${iso.slice(14, 16)}`;
		}

		// Conteúdo do parecer: usa comentarios_tcc se disponível, caso contrário linhas em branco
		const comentariosTcc = tcc.comentarios_tcc?.trim() || "";
		const parecerConteudo = comentariosTcc
			? `<p style="margin:4px 0; white-space:pre-wrap; line-height:1.6;">${comentariosTcc}</p>`
			: `<span class="linha"></span><span class="linha"></span><span class="linha"></span>`;

		// Substituições
		html = html
			.replace(/#nomeCurso#/g, curso?.nome || "Ciência da Computação")
			.replace(/#tccFase#/g, faseLabel)
			.replace(/#nomeAluno#/g, dicente?.nome || "___________________________")
			.replace(/#matriculaAluno#/g, dicente?.matricula || "___________________________")
			.replace(/#titulo#/g, tcc.titulo || "___________________________")
			.replace(/#orientador#/g, orientadorNome)
			.replace(/#siapeOrientador#/g, siapeOrientador || "___________________________")
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

		res.setHeader("Content-Type", "text/html; charset=utf-8");
		res.send(html);
	} catch (error) {
		console.error("Erro ao gerar ata de defesa:", error);
		res.status(500).json({ message: "Erro interno do servidor ao gerar ata" });
	}
};

module.exports = {
	retornaTodasDefesas,
	retornaDefesasPorTcc,
	criaDefesa,
	atualizaDefesa,
	registraAvaliacaoDefesa,
	deletaDefesa,
	gerenciarBancaDefesa,
	agendarDefesa,
	adicionarMembroExterno,
	listarMembrosExternosTcc,
	removerMembroExterno,
	gerarAtaDefesa,
};
