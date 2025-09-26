const dashboardRepository = require("../repository/dashboard-repository");
const { calcularAnoSemestreAtual } = require("./ano-semestre-service");

// Função para contar dicentes com orientador definido
const contarDicentesComOrientador = async (req, res) => {
	try {
		const { ano, semestre, id_curso, fase, codigo_docente } = req.query;
		const filtros = {
			ano: ano ? parseInt(ano) : undefined,
			semestre: semestre ? parseInt(semestre) : undefined,
			id_curso: id_curso ? parseInt(id_curso) : undefined,
			fase: fase ? parseInt(fase) : undefined,
			codigo_docente: codigo_docente || undefined,
		};

		const resultado = await calcularDicentesComOrientador(filtros);
		res.status(200).json(resultado);
	} catch (error) {
		console.error(
			"Erro ao obter contagem de dicentes com orientador definido:",
			error,
		);
		res.status(500).json({ message: "Erro interno do servidor" });
	}
};

// Função para contar convites de banca por status
const contarConvitesBancaStatus = async (req, res) => {
	try {
		const { ano, semestre, id_curso, fase, codigo_docente } = req.query;
		const filtros = {
			ano: ano ? parseInt(ano) : undefined,
			semestre: semestre ? parseInt(semestre) : undefined,
			id_curso: id_curso ? parseInt(id_curso) : undefined,
			fase: fase ? parseInt(fase) : undefined,
			codigo_docente: codigo_docente || undefined,
		};

		const resultado = await calcularConvitesBancaStatus(filtros);
		res.status(200).json(resultado);
	} catch (error) {
		console.error("Erro ao obter status de convites de banca:", error);
		res.status(500).json({ message: "Erro interno do servidor" });
	}
};

// Função para listar defesas agendadas
const listarDefesasAgendadas = async (req, res) => {
	try {
		const { ano, semestre, id_curso, fase, codigo_docente } = req.query;
		const filtros = {
			ano: ano ? parseInt(ano) : undefined,
			semestre: semestre ? parseInt(semestre) : undefined,
			id_curso: id_curso ? parseInt(id_curso) : undefined,
			fase: fase ? parseInt(fase) : undefined,
			codigo_docente: codigo_docente || undefined,
		};

		const resultado = await buscarDefesasAgendadas(filtros);
		res.status(200).json(resultado);
	} catch (error) {
		console.error("Erro ao obter defesas agendadas:", error);
		res.status(500).json({ message: "Erro interno do servidor" });
	}
};

// Função para contar TCCs por etapa
const contarTccPorEtapa = async (req, res) => {
	try {
		const { ano, semestre, id_curso, fase, codigo_docente } = req.query;
		const filtros = {
			ano: ano ? parseInt(ano) : undefined,
			semestre: semestre ? parseInt(semestre) : undefined,
			id_curso: id_curso ? parseInt(id_curso) : undefined,
			fase: fase ? parseInt(fase) : undefined,
			codigo_docente: codigo_docente || undefined,
		};

		const resultado = await calcularTccPorEtapa(filtros);
		res.status(200).json(resultado);
	} catch (error) {
		console.error("Erro ao obter distribuição por etapa:", error);
		res.status(500).json({ message: "Erro interno do servidor" });
	}
};

// Função para contar convites por período
const contarConvitesPorPeriodo = async (req, res) => {
	try {
		const { ano, semestre, id_curso, fase, codigo_docente } = req.query;
		const filtros = {
			ano: ano ? parseInt(ano) : undefined,
			semestre: semestre ? parseInt(semestre) : undefined,
			id_curso: id_curso ? parseInt(id_curso) : undefined,
			fase: fase ? parseInt(fase) : undefined,
			codigo_docente: codigo_docente || undefined,
		};

		const resultado = await calcularConvitesPorPeriodo(filtros);
		res.status(200).json(resultado);
	} catch (error) {
		console.error("Erro ao obter convites por período:", error);
		res.status(500).json({ message: "Erro interno do servidor" });
	}
};

// Função para contar convites de orientação por status
const contarConvitesOrientacaoStatus = async (req, res) => {
	try {
		const { ano, semestre, id_curso, fase, codigo_docente } = req.query;
		const filtros = {
			ano: ano ? parseInt(ano) : undefined,
			semestre: semestre ? parseInt(semestre) : undefined,
			id_curso: id_curso ? parseInt(id_curso) : undefined,
			fase: fase ? parseInt(fase) : undefined,
			codigo_docente: codigo_docente || undefined,
		};

		const resultado = await calcularConvitesOrientacaoStatus(filtros);
		res.status(200).json(resultado);
	} catch (error) {
		console.error("Erro ao obter status de convites de orientação:", error);
		res.status(500).json({ message: "Erro interno do servidor" });
	}
};

// Função para contar orientandos por docente
const contarOrientandosPorDocente = async (req, res) => {
	try {
		const { ano, semestre, id_curso, fase } = req.query;
		const filtros = {
			ano: ano ? parseInt(ano) : undefined,
			semestre: semestre ? parseInt(semestre) : undefined,
			id_curso: id_curso ? parseInt(id_curso) : undefined,
			fase: fase ? parseInt(fase) : undefined,
		};

		const resultado = await calcularOrientandosPorDocente(filtros);
		res.status(200).json(resultado);
	} catch (error) {
		console.error("Erro ao obter orientandos por docente:", error);
		res.status(500).json({ message: "Erro interno do servidor" });
	}
};

// Função para contar defesas aceitas por docente
const contarDefesasAceitasPorDocente = async (req, res) => {
	try {
		const { ano, semestre, id_curso, fase } = req.query;
		const filtros = {
			ano: ano ? parseInt(ano) : undefined,
			semestre: semestre ? parseInt(semestre) : undefined,
			id_curso: id_curso ? parseInt(id_curso) : undefined,
			fase: fase ? parseInt(fase) : undefined,
		};

		const resultado = await calcularDefesasAceitasPorDocente(filtros);
		res.status(200).json(resultado);
	} catch (error) {
		console.error("Erro ao obter defesas aceitas por docente:", error);
		res.status(500).json({ message: "Erro interno do servidor" });
	}
};

/**
 * Função utilitária para calcular dicentes com orientador
 */
const calcularDicentesComOrientador = async (filtros) => {
	const { ano, semestre, id_curso, fase } = filtros || {};

	let anoAlvo = ano;
	let semestreAlvo = semestre;

	if (!anoAlvo || !semestreAlvo) {
		const atual = await calcularAnoSemestreAtual();
		anoAlvo = atual.ano;
		semestreAlvo = atual.semestre;
	}

	// where base para a oferta
	const tccWhere = {
		ano: parseInt(anoAlvo),
		semestre: parseInt(semestreAlvo),
	};
	if (fase) tccWhere.fase = parseInt(fase);

	if (id_curso) {
		tccWhere.id_curso = parseInt(id_curso);
	}

	// Total de TCCs na oferta
	const total = await dashboardRepository.contarTccsNaOferta(tccWhere);

	// Contar TCCs que têm pelo menos uma orientação com orientador=true
	const comOrientador = await dashboardRepository.contarTccsComOrientador(
		tccWhere,
		[
			{
				model: require("../models").Orientacao,
				required: true,
				where: { orientador: true },
			},
		],
	);

	return {
		ano: anoAlvo,
		semestre: semestreAlvo,
		fase: fase ? parseInt(fase) : undefined,
		id_curso: id_curso ? parseInt(id_curso) : undefined,
		total,
		comOrientador,
	};
};

/**
 * Função utilitária para calcular TCCs por etapa
 */
const calcularTccPorEtapa = async (filtros) => {
	const { ano, semestre, id_curso, fase, codigo_docente } = filtros || {};

	let anoAlvo = ano;
	let semestreAlvo = semestre;

	if (!anoAlvo || !semestreAlvo) {
		const atual = await calcularAnoSemestreAtual();
		anoAlvo = atual.ano;
		semestreAlvo = atual.semestre;
	}

	const where = {
		ano: parseInt(anoAlvo),
		semestre: parseInt(semestreAlvo),
	};
	if (fase) where.fase = parseInt(fase);
	if (id_curso) where.id_curso = parseInt(id_curso);

	const include = codigo_docente
		? [
				{
					model: require("../models").Orientacao,
					required: true,
					attributes: [],
					where: {
						codigo_docente: String(codigo_docente),
						orientador: true,
					},
				},
			]
		: [];

	const resultados = await dashboardRepository.buscarDistribuicaoPorEtapa(
		where,
		include,
		["TrabalhoConclusao.etapa"],
		[["etapa", "ASC"]],
	);

	// Normaliza: etapa nula vira 0
	const distribuicao = resultados.map((r) => ({
		etapa: r.etapa === null ? 0 : parseInt(r.etapa),
		quantidade: parseInt(r.quantidade),
	}));

	return {
		ano: anoAlvo,
		semestre: semestreAlvo,
		fase: fase ? parseInt(fase) : undefined,
		id_curso: id_curso ? parseInt(id_curso) : undefined,
		codigo_docente: codigo_docente ? String(codigo_docente) : undefined,
		distribuicao,
	};
};

/**
 * Função utilitária para calcular convites por período
 */
const calcularConvitesPorPeriodo = async (filtros) => {
	const { ano, semestre, id_curso, fase, codigo_docente } = filtros || {};

	let anoAlvo = ano;
	let semestreAlvo = semestre;

	if (!anoAlvo || !semestreAlvo) {
		const atual = await calcularAnoSemestreAtual();
		anoAlvo = atual.ano;
		semestreAlvo = atual.semestre;
	}

	// Buscar período (inicio/fim) do semestre
	const periodo = await dashboardRepository.buscarPeriodoSemestre(
		anoAlvo,
		semestreAlvo,
	);

	if (!periodo) {
		return {
			ano: anoAlvo,
			semestre: semestreAlvo,
			fase: parseInt(fase),
			id_curso: id_curso ? parseInt(id_curso) : undefined,
			inicio: null,
			fim: null,
			pontos: [],
		};
	}

	const inicioPeriodo = new Date(periodo.inicio);
	const fimPeriodo = new Date(periodo.fim);

	const Op = require("../models").Sequelize.Op;

	// Buscar convites enviados dentro do período
	const where = {
		data_envio: {
			[Op.between]: [inicioPeriodo, fimPeriodo],
		},
		...(codigo_docente ? { codigo_docente: String(codigo_docente) } : {}),
	};

	const include = [
		{
			model: require("../models").TrabalhoConclusao,
			required: true,
			attributes: [],
			where: {
				ano: parseInt(anoAlvo),
				semestre: parseInt(semestreAlvo),
				...(fase ? { fase: parseInt(fase) } : {}),
				...(id_curso ? { id_curso: parseInt(id_curso) } : {}),
			},
		},
	];

	const convites = await dashboardRepository.buscarConvitesPorPeriodo(
		where,
		include,
	);

	// Inicializar mapa diário com zero
	const pontosMap = new Map();
	for (
		let d = new Date(
			inicioPeriodo.getFullYear(),
			inicioPeriodo.getMonth(),
			inicioPeriodo.getDate(),
		);
		d <= fimPeriodo;
		d.setDate(d.getDate() + 1)
	) {
		const chave = d.toISOString().slice(0, 10); // YYYY-MM-DD
		pontosMap.set(chave, { data: chave, orientacao: 0, banca: 0 });
	}

	// Acumular convites nas datas
	for (const c of convites) {
		const data = new Date(c.data_envio);
		const chave = data.toISOString().slice(0, 10);
		const existente = pontosMap.get(chave);
		if (existente) {
			if (c.orientacao) existente.orientacao += 1;
			else existente.banca += 1;
		}
	}

	const pontos = Array.from(pontosMap.values());

	return {
		ano: anoAlvo,
		semestre: semestreAlvo,
		fase: fase ? parseInt(fase) : undefined,
		id_curso: id_curso ? parseInt(id_curso) : undefined,
		codigo_docente: codigo_docente ? String(codigo_docente) : undefined,
		inicio: inicioPeriodo,
		fim: fimPeriodo,
		pontos,
	};
};

/**
 * Função utilitária para calcular convites de orientação por status
 */
const calcularConvitesOrientacaoStatus = async (filtros) => {
	const { ano, semestre, id_curso, fase, codigo_docente } = filtros || {};

	let anoAlvo = ano;
	let semestreAlvo = semestre;

	if (!anoAlvo || !semestreAlvo) {
		const atual = await calcularAnoSemestreAtual();
		anoAlvo = atual.ano;
		semestreAlvo = atual.semestre;
	}

	// Agregar convites de orientação vinculados à oferta
	const where = {
		orientacao: true,
		...(codigo_docente ? { codigo_docente: String(codigo_docente) } : {}),
	};

	const include = [
		{
			model: require("../models").TrabalhoConclusao,
			required: true,
			attributes: [],
			where: {
				ano: parseInt(anoAlvo),
				semestre: parseInt(semestreAlvo),
				...(fase ? { fase: parseInt(fase) } : {}),
				...(id_curso ? { id_curso: parseInt(id_curso) } : {}),
			},
		},
	];

	const resultado = await dashboardRepository.buscarConvitesOrientacaoStatus(
		where,
		include,
	);

	const linha = resultado?.[0] || {};
	const respondidos = parseInt(linha.respondidos || 0);
	const pendentes = parseInt(linha.pendentes || 0);
	const total = parseInt(linha.total || 0);

	return {
		ano: anoAlvo,
		semestre: semestreAlvo,
		fase: fase ? parseInt(fase) : undefined,
		id_curso: id_curso ? parseInt(id_curso) : undefined,
		codigo_docente: codigo_docente ? String(codigo_docente) : undefined,
		respondidos,
		pendentes,
		total,
	};
};

/**
 * Função utilitária para calcular convites de banca por status
 */
const calcularConvitesBancaStatus = async (filtros) => {
	const { ano, semestre, id_curso, fase, codigo_docente } = filtros || {};

	let anoAlvo = ano;
	let semestreAlvo = semestre;

	if (!anoAlvo || !semestreAlvo) {
		const atual = await calcularAnoSemestreAtual();
		anoAlvo = atual.ano;
		semestreAlvo = atual.semestre;
	}

	const where = {
		orientacao: false,
		...(codigo_docente ? { codigo_docente: String(codigo_docente) } : {}),
	};

	const include = [
		{
			model: require("../models").TrabalhoConclusao,
			required: true,
			attributes: [],
			where: {
				ano: parseInt(anoAlvo),
				semestre: parseInt(semestreAlvo),
				...(fase ? { fase: parseInt(fase) } : {}),
				...(id_curso ? { id_curso: parseInt(id_curso) } : {}),
			},
		},
	];

	const resultado = await dashboardRepository.buscarConvitesBancaStatus(
		where,
		include,
	);

	const linha = resultado?.[0] || {};
	const respondidos = parseInt(linha.respondidos || 0);
	const pendentes = parseInt(linha.pendentes || 0);
	const total = parseInt(linha.total || 0);

	return {
		ano: anoAlvo,
		semestre: semestreAlvo,
		fase: fase ? parseInt(fase) : undefined,
		id_curso: id_curso ? parseInt(id_curso) : undefined,
		codigo_docente: codigo_docente ? String(codigo_docente) : undefined,
		respondidos,
		pendentes,
		total,
	};
};

/**
 * Função utilitária para calcular orientandos por docente
 */
const calcularOrientandosPorDocente = async (filtros) => {
	const { ano, semestre, id_curso, fase } = filtros || {};

	let anoAlvo = ano;
	let semestreAlvo = semestre;

	if (!anoAlvo || !semestreAlvo) {
		const atual = await calcularAnoSemestreAtual();
		anoAlvo = atual.ano;
		semestreAlvo = atual.semestre;
	}

	// where base para TCC
	const tccWhere = {
		ano: parseInt(anoAlvo),
		semestre: parseInt(semestreAlvo),
	};
	if (fase) tccWhere.fase = parseInt(fase);
	if (id_curso) tccWhere.id_curso = parseInt(id_curso);

	// 1) Obter a lista de docentes disponíveis em orientador-curso
	const whereOrientadorCurso = {};
	if (id_curso) whereOrientadorCurso.id_curso = parseInt(id_curso);

	const includeOrientadorCurso = [
		{
			model: require("../models").Docente,
			as: "docente",
			attributes: ["codigo", "nome", "siape"],
		},
	];

	const orientadoresCurso = await dashboardRepository.buscarOrientadoresCurso(
		whereOrientadorCurso,
		includeOrientadorCurso,
	);

	// Deduplicar por codigo_docente
	const docentesMap = new Map();
	for (const oc of orientadoresCurso) {
		const codigo = oc.codigo_docente || oc.docente?.codigo;
		const nome = oc.docente?.nome || "";
		if (!codigo) continue;
		if (!docentesMap.has(codigo)) {
			docentesMap.set(codigo, {
				codigo_docente: codigo,
				nome,
				quantidade: 0,
			});
		}
	}

	// Se não houver id_curso e a tabela de orientador-curso estiver vazia,
	// não há docentes a listar; retornar vazio de forma consistente
	if (docentesMap.size === 0 && !id_curso) {
		return {
			ano: anoAlvo,
			semestre: semestreAlvo,
			fase: fase ? parseInt(fase) : undefined,
			id_curso: undefined,
			itens: [],
		};
	}

	// 2) Agregar contagem de TCCs por docente (orientador principal)
	const includeOrientacao = [
		{
			model: require("../models").TrabalhoConclusao,
			required: true,
			attributes: [],
			where: tccWhere,
		},
	];

	const contagens = await dashboardRepository.contarOrientandosPorDocente(
		{ orientador: true },
		includeOrientacao,
		["codigo_docente"],
	);

	// 3) Mesclar contagens nas entradas dos docentes disponíveis
	for (const c of contagens) {
		const codigo = c.codigo_docente;
		const qtd = parseInt(c.quantidade || 0);
		if (docentesMap.size > 0) {
			// Quando temos a lista de disponíveis, apenas preenche para os que existem
			const existente = docentesMap.get(codigo);
			if (existente) existente.quantidade = qtd;
		} else {
			// Fallback: se não havia disponíveis (p.ex. filtrado por curso mas tabela vazia),
			// ainda assim retornamos aqueles que possuem contagem
			docentesMap.set(codigo, {
				codigo_docente: codigo,
				nome: codigo,
				quantidade: qtd,
			});
		}
	}

	// 4) Construir array ordenado por quantidade desc, depois por nome asc
	const itens = Array.from(docentesMap.values()).sort((a, b) => {
		if (b.quantidade !== a.quantidade) return b.quantidade - a.quantidade;
		return String(a.nome).localeCompare(String(b.nome));
	});

	return {
		ano: anoAlvo,
		semestre: semestreAlvo,
		fase: fase ? parseInt(fase) : undefined,
		id_curso: id_curso ? parseInt(id_curso) : undefined,
		itens,
	};
};

/**
 * Função utilitária para calcular defesas aceitas por docente
 */
const calcularDefesasAceitasPorDocente = async (filtros) => {
	const { ano, semestre, id_curso, fase } = filtros || {};

	let anoAlvo = ano;
	let semestreAlvo = semestre;

	if (!anoAlvo || !semestreAlvo) {
		const atual = await calcularAnoSemestreAtual();
		anoAlvo = atual.ano;
		semestreAlvo = atual.semestre;
	}

	// Montar where do TCC para filtrar pela oferta (ano/semestre/curso)
	// Importante: não filtrar por fase aqui, pois a fase relevante é a do convite
	// (o TCC pode ter mudado de fase posteriormente).
	const tccWhere = {
		ano: parseInt(anoAlvo),
		semestre: parseInt(semestreAlvo),
	};
	if (id_curso) tccWhere.id_curso = parseInt(id_curso);

	// 1) Obter a lista de docentes disponíveis em orientador-curso
	const whereOrientadorCurso = {};
	if (id_curso) whereOrientadorCurso.id_curso = parseInt(id_curso);

	const includeOrientadorCurso = [
		{
			model: require("../models").Docente,
			as: "docente",
			attributes: ["codigo", "nome", "siape"],
		},
	];

	const orientadoresCurso = await dashboardRepository.buscarOrientadoresCurso(
		whereOrientadorCurso,
		includeOrientadorCurso,
	);

	// Deduplicar por codigo_docente
	const docentesMap = new Map();
	for (const oc of orientadoresCurso) {
		const codigo = oc.codigo_docente || oc.docente?.codigo;
		const nome = oc.docente?.nome || "";
		if (!codigo) continue;
		if (!docentesMap.has(codigo)) {
			docentesMap.set(codigo, {
				codigo_docente: codigo,
				nome,
				quantidade: 0,
			});
		}
	}

	// Se não houver id_curso e a tabela de orientador-curso estiver vazia,
	// manter comportamento consistente com orientandos-por-docente
	if (docentesMap.size === 0 && !id_curso) {
		return {
			ano: anoAlvo,
			semestre: semestreAlvo,
			fase: fase ? parseInt(fase) : undefined,
			id_curso: undefined,
			itens: [],
		};
	}

	// 2) Agregar convites de banca aceitos por docente
	// Montar where do convite (aceito, banca e fase quando informada)
	const conviteWhere = { aceito: true, orientacao: false };
	if (fase) conviteWhere.fase = parseInt(fase);

	const includeConvite = [
		{
			model: require("../models").TrabalhoConclusao,
			required: true,
			attributes: [],
			where: tccWhere,
		},
	];

	const contagens = await dashboardRepository.contarDefesasAceitasPorDocente(
		conviteWhere,
		includeConvite,
		["codigo_docente"],
	);

	// 3) Mesclar contagens nas entradas dos docentes disponíveis
	for (const c of contagens) {
		const codigo = c.codigo_docente;
		const qtd = parseInt(c.quantidade || 0);
		if (docentesMap.size > 0) {
			const existente = docentesMap.get(codigo);
			if (existente) existente.quantidade = qtd;
		} else {
			// Fallback: incluir docentes com contagem mesmo sem lista disponível (quando filtrado por curso)
			docentesMap.set(codigo, {
				codigo_docente: codigo,
				nome: codigo,
				quantidade: qtd,
			});
		}
	}

	const itens = Array.from(docentesMap.values()).sort((a, b) => {
		if (b.quantidade !== a.quantidade) return b.quantidade - a.quantidade;
		return String(a.nome).localeCompare(String(b.nome));
	});

	return {
		ano: anoAlvo,
		semestre: semestreAlvo,
		fase: fase ? parseInt(fase) : undefined,
		id_curso: id_curso ? parseInt(id_curso) : undefined,
		itens,
	};
};

/**
 * Função utilitária para buscar defesas agendadas
 */
const buscarDefesasAgendadas = async (filtros) => {
	const { ano, semestre, id_curso, fase, codigo_docente } = filtros || {};

	let anoAlvo = ano;
	let semestreAlvo = semestre;

	if (!anoAlvo || !semestreAlvo) {
		const atual = await calcularAnoSemestreAtual();
		anoAlvo = atual.ano;
		semestreAlvo = atual.semestre;
	}

	const Op = require("../models").Sequelize.Op;

	// where para TCC (oferta)
	const tccWhere = {
		ano: parseInt(anoAlvo),
		semestre: parseInt(semestreAlvo),
	};
	if (id_curso) tccWhere.id_curso = parseInt(id_curso);

	// where para Defesa
	const defesaWhere = { data_defesa: { [Op.ne]: null } };
	if (fase) defesaWhere.fase = parseInt(fase);
	if (codigo_docente) defesaWhere.membro_banca = String(codigo_docente);

	// Buscar defesas marcadas (data_defesa != null) dentro da oferta
	const include = [
		{
			model: require("../models").TrabalhoConclusao,
			required: true,
			attributes: [
				"id",
				"ano",
				"semestre",
				"id_curso",
				"fase",
				"titulo",
				"matricula",
			],
			where: tccWhere,
			include: [
				{
					model: require("../models").Dicente,
					attributes: ["matricula", "nome"],
				},
			],
		},
		{
			model: require("../models").Docente,
			as: "membroBanca",
			attributes: ["codigo", "nome"],
		},
	];

	const defesas = await dashboardRepository.buscarDefesasAgendadas(
		defesaWhere,
		include,
	);

	// Agregar por (id_tcc, data_defesa)
	const grupos = new Map();
	for (const d of defesas) {
		const idTcc = d.id_tcc;
		const dataHora = new Date(d.data_defesa);
		if (Number.isNaN(dataHora.getTime())) continue;
		const dataISO = dataHora.toISOString();
		const chave = `${idTcc}|${dataISO}`;

		const nomeEstudante = d.TrabalhoConclusao?.Dicente?.nome || "";
		const titulo = d.TrabalhoConclusao?.titulo || "";
		const faseNum = parseInt(d.fase || d.TrabalhoConclusao?.fase || 0) || 0;
		const faseLabel = String(faseNum) === "1" ? "Projeto" : "TCC";

		if (!grupos.has(chave)) {
			grupos.set(chave, {
				id_tcc: idTcc,
				data: dataISO.slice(0, 10),
				hora: dataISO.slice(11, 16),
				fase: faseNum,
				fase_label: faseLabel,
				estudante: nomeEstudante,
				titulo,
				orientador: "",
				banca: [],
			});
		}

		const item = grupos.get(chave);
		const nomeDocente = d.membroBanca?.nome || d.membro_banca || "";
		if (d.orientador) item.orientador = nomeDocente;
		else if (nomeDocente) item.banca.push(nomeDocente);
	}

	const itens = Array.from(grupos.values()).sort((a, b) => {
		if (a.data !== b.data) return a.data.localeCompare(b.data);
		if (a.hora !== b.hora) return a.hora.localeCompare(b.hora);
		return String(a.estudante).localeCompare(String(b.estudante), "pt", {
			sensitivity: "base",
		});
	});

	return {
		ano: anoAlvo,
		semestre: semestreAlvo,
		fase: fase ? parseInt(fase) : undefined,
		id_curso: id_curso ? parseInt(id_curso) : undefined,
		codigo_docente: codigo_docente ? String(codigo_docente) : undefined,
		itens,
	};
};

module.exports = {
	contarDicentesComOrientador,
	contarConvitesBancaStatus,
	listarDefesasAgendadas,
	contarTccPorEtapa,
	contarConvitesPorPeriodo,
	contarConvitesOrientacaoStatus,
	contarOrientandosPorDocente,
	contarDefesasAceitasPorDocente,
};
