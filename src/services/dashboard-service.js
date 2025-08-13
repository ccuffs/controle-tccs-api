const model = require("../models");
const { obterAnoSemestreAtual } = require("./ano-semestre-service");

/**
 * Conta quantos dicentes possuem orientador principal definido
 * para os filtros informados. Se ano/semestre não forem informados,
 * utiliza o período atual calculado por obterAnoSemestreAtual.
 *
 * Retorna também o total de dicentes na oferta para referência.
 */
const contarDicentesComOrientador = async (filtros) => {
	const { ano, semestre, id_curso, fase } = filtros || {};

	let anoAlvo = ano;
	let semestreAlvo = semestre;

	if (!anoAlvo || !semestreAlvo) {
		const atual = await obterAnoSemestreAtual();
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
	const total = await model.TrabalhoConclusao.count({ where: tccWhere });

	// Contar TCCs que têm pelo menos uma orientação com orientador=true
	const comOrientador = await model.TrabalhoConclusao.count({
		where: tccWhere,
		include: [
			{
				model: model.Orientacao,
				required: true,
				where: { orientador: true },
			},
		],
		distinct: true,
	});

	return {
		ano: anoAlvo,
		semestre: semestreAlvo,
		fase: fase ? parseInt(fase) : undefined,
		id_curso: id_curso ? parseInt(id_curso) : undefined,
		total,
		comOrientador,
	};
};

module.exports = { contarDicentesComOrientador };

/**
 * Retorna distribuição de TCCs por etapa, considerando filtros.
 * Filtros: ano, semestre, id_curso (opcional), fase (default 1), codigo_docente (opcional)
 * Quando codigo_docente é informado, considera apenas TCCs nos quais o docente é orientador principal.
 */
const contarTccPorEtapa = async (filtros) => {
	const { ano, semestre, id_curso, fase, codigo_docente } = filtros || {};

	let anoAlvo = ano;
	let semestreAlvo = semestre;

	if (!anoAlvo || !semestreAlvo) {
		const atual = await obterAnoSemestreAtual();
		anoAlvo = atual.ano;
		semestreAlvo = atual.semestre;
	}

	const where = {
		ano: parseInt(anoAlvo),
		semestre: parseInt(semestreAlvo),
	};
	if (fase) where.fase = parseInt(fase);
	if (id_curso) where.id_curso = parseInt(id_curso);

	const resultados = await model.TrabalhoConclusao.findAll({
		attributes: [
			"etapa",
			[
				model.Sequelize.fn(
					"COUNT",
					model.Sequelize.col("TrabalhoConclusao.id"),
				),
				"quantidade",
			],
		],
		where,
		include: codigo_docente
			? [
					{
						model: model.Orientacao,
						required: true,
						attributes: [],
						where: {
							codigo_docente: String(codigo_docente),
							orientador: true,
						},
					},
				]
			: [],
		group: ["TrabalhoConclusao.etapa"],
		order: [["etapa", "ASC"]],
		raw: true,
	});

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

module.exports.contarTccPorEtapa = contarTccPorEtapa;

/**
 * Retorna série temporal diária de convites enviados no período do semestre
 * informado (inicio/fim conforme tabela ano_semestre), segmentada por tipo:
 * - orientacao: convites para orientação (Convite.orientacao = true)
 * - banca: convites para banca (Convite.orientacao = false)
 *
 * Filtros: ano, semestre, id_curso (opcional), fase (default 1), codigo_docente (opcional)
 */
const contarConvitesPorPeriodo = async (filtros) => {
	const { ano, semestre, id_curso, fase, codigo_docente } = filtros || {};

	let anoAlvo = ano;
	let semestreAlvo = semestre;

	if (!anoAlvo || !semestreAlvo) {
		const atual = await obterAnoSemestreAtual();
		anoAlvo = atual.ano;
		semestreAlvo = atual.semestre;
	}

	// Buscar período (inicio/fim) do semestre
	const periodo = await model.AnoSemestre.findOne({
		where: { ano: parseInt(anoAlvo), semestre: parseInt(semestreAlvo) },
		raw: true,
	});

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

	const Op = model.Sequelize.Op;

	// Buscar convites enviados dentro do período e vinculados a TCCs que
	// correspondam aos filtros (ano, semestre, fase e curso)
	const convites = await model.Convite.findAll({
		attributes: ["data_envio", "orientacao"],
		where: {
			data_envio: {
				[Op.between]: [inicioPeriodo, fimPeriodo],
			},
			...(codigo_docente
				? { codigo_docente: String(codigo_docente) }
				: {}),
		},
		include: [
			{
				model: model.TrabalhoConclusao,
				required: true,
				attributes: [],
				where: {
					ano: parseInt(anoAlvo),
					semestre: parseInt(semestreAlvo),
					...(fase ? { fase: parseInt(fase) } : {}),
					...(id_curso ? { id_curso: parseInt(id_curso) } : {}),
				},
			},
		],
		raw: true,
	});

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

module.exports.contarConvitesPorPeriodo = contarConvitesPorPeriodo;

/**
 * Retorna contagem agregada de convites de orientação por status dentro
 * do período do semestre informado (inicio/fim conforme tabela ano_semestre).
 * Status considerados:
 * - respondidos: data_feedback != null (inclui aceitos e rejeitados)
 * - pendentes: data_feedback == null
 *
 * Filtros: ano, semestre, id_curso (opcional), fase (opcional), codigo_docente (opcional)
 */
const contarConvitesOrientacaoStatus = async (filtros) => {
	const { ano, semestre, id_curso, fase, codigo_docente } = filtros || {};

	let anoAlvo = ano;
	let semestreAlvo = semestre;

	if (!anoAlvo || !semestreAlvo) {
		const atual = await obterAnoSemestreAtual();
		anoAlvo = atual.ano;
		semestreAlvo = atual.semestre;
	}

	// Buscar período (inicio/fim) do semestre
	const periodo = await model.AnoSemestre.findOne({
		where: { ano: parseInt(anoAlvo), semestre: parseInt(semestreAlvo) },
		raw: true,
	});

	if (!periodo) {
		return {
			ano: anoAlvo,
			semestre: semestreAlvo,
			fase: fase ? parseInt(fase) : undefined,
			id_curso: id_curso ? parseInt(id_curso) : undefined,
			inicio: null,
			fim: null,
			respondidos: 0,
			pendentes: 0,
			total: 0,
		};
	}

	const inicioPeriodo = new Date(periodo.inicio);
	const fimPeriodo = new Date(periodo.fim);

	const { fn, col, literal, Op } = model.Sequelize;

	// Agregar convites de orientação no período e vinculados à oferta
	const resultado = await model.Convite.findAll({
		attributes: [
			[
				fn(
					"SUM",
					literal(
						'CASE WHEN "Convite"."data_feedback" IS NOT NULL THEN 1 ELSE 0 END',
					),
				),
				"respondidos",
			],
			[
				fn(
					"SUM",
					literal(
						'CASE WHEN "Convite"."data_feedback" IS NULL THEN 1 ELSE 0 END',
					),
				),
				"pendentes",
			],
			[fn("COUNT", col("Convite.id_tcc")), "total"],
		],
		where: {
			orientacao: true,
			data_envio: {
				[Op.between]: [inicioPeriodo, fimPeriodo],
			},
			...(codigo_docente
				? { codigo_docente: String(codigo_docente) }
				: {}),
		},
		include: [
			{
				model: model.TrabalhoConclusao,
				required: true,
				attributes: [],
				where: {
					ano: parseInt(anoAlvo),
					semestre: parseInt(semestreAlvo),
					...(fase ? { fase: parseInt(fase) } : {}),
					...(id_curso ? { id_curso: parseInt(id_curso) } : {}),
				},
			},
		],
		raw: true,
	});

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
		inicio: inicioPeriodo,
		fim: fimPeriodo,
		respondidos,
		pendentes,
		total,
	};
};

module.exports.contarConvitesOrientacaoStatus = contarConvitesOrientacaoStatus;

/**
 * Agrega convites de banca por status (respondidos vs pendentes) no período do semestre.
 * Pendentes: data_feedback IS NULL. Respondidos: data_feedback IS NOT NULL.
 * Filtros: ano, semestre, id_curso (opcional), fase (opcional), codigo_docente (opcional)
 */
const contarConvitesBancaStatus = async (filtros) => {
	const { ano, semestre, id_curso, fase, codigo_docente } = filtros || {};

	let anoAlvo = ano;
	let semestreAlvo = semestre;

	if (!anoAlvo || !semestreAlvo) {
		const atual = await obterAnoSemestreAtual();
		anoAlvo = atual.ano;
		semestreAlvo = atual.semestre;
	}

	const periodo = await model.AnoSemestre.findOne({
		where: { ano: parseInt(anoAlvo), semestre: parseInt(semestreAlvo) },
		raw: true,
	});

	if (!periodo) {
		return {
			ano: anoAlvo,
			semestre: semestreAlvo,
			fase: fase ? parseInt(fase) : undefined,
			id_curso: id_curso ? parseInt(id_curso) : undefined,
			inicio: null,
			fim: null,
			respondidos: 0,
			pendentes: 0,
			total: 0,
		};
	}

	const inicioPeriodo = new Date(periodo.inicio);
	const fimPeriodo = new Date(periodo.fim);

	const { fn, col, literal, Op } = model.Sequelize;

	const resultado = await model.Convite.findAll({
		attributes: [
			[
				fn(
					"SUM",
					literal(
						'CASE WHEN "Convite"."data_feedback" IS NOT NULL THEN 1 ELSE 0 END',
					),
				),
				"respondidos",
			],
			[
				fn(
					"SUM",
					literal(
						'CASE WHEN "Convite"."data_feedback" IS NULL THEN 1 ELSE 0 END',
					),
				),
				"pendentes",
			],
			[fn("COUNT", col("Convite.id_tcc")), "total"],
		],
		where: {
			orientacao: false,
			data_envio: {
				[Op.between]: [inicioPeriodo, fimPeriodo],
			},
			...(codigo_docente
				? { codigo_docente: String(codigo_docente) }
				: {}),
		},
		include: [
			{
				model: model.TrabalhoConclusao,
				required: true,
				attributes: [],
				where: {
					ano: parseInt(anoAlvo),
					semestre: parseInt(semestreAlvo),
					...(fase ? { fase: parseInt(fase) } : {}),
					...(id_curso ? { id_curso: parseInt(id_curso) } : {}),
				},
			},
		],
		raw: true,
	});

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
		inicio: inicioPeriodo,
		fim: fimPeriodo,
		respondidos,
		pendentes,
		total,
	};
};

module.exports.contarConvitesBancaStatus = contarConvitesBancaStatus;

/**
 * Retorna contagem de orientandos (TCCs onde o docente é orientador principal)
 * por docente, incluindo docentes disponíveis em orientador-curso mesmo com 0.
 * Filtros: ano, semestre, id_curso (opcional), fase (opcional)
 */
const contarOrientandosPorDocente = async (filtros) => {
	const { ano, semestre, id_curso, fase } = filtros || {};

	let anoAlvo = ano;
	let semestreAlvo = semestre;

	if (!anoAlvo || !semestreAlvo) {
		const atual = await obterAnoSemestreAtual();
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

	const orientadoresCurso = await model.OrientadorCurso.findAll({
		where: whereOrientadorCurso,
		include: [
			{
				model: model.Docente,
				as: "docente",
				attributes: ["codigo", "nome"],
			},
		],
		raw: true,
		nest: true,
	});

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
	const { fn, col, Op } = model.Sequelize;
	const contagens = await model.Orientacao.findAll({
		attributes: [
			"codigo_docente",
			[
				fn("COUNT", fn("DISTINCT", col("Orientacao.id_tcc"))),
				"quantidade",
			],
		],
		where: { orientador: true },
		include: [
			{
				model: model.TrabalhoConclusao,
				required: true,
				attributes: [],
				where: tccWhere,
			},
		],
		group: ["codigo_docente"],
		raw: true,
	});

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

module.exports.contarOrientandosPorDocente = contarOrientandosPorDocente;

/**
 * Retorna contagem de defesas aceitas (convites de banca aceitos) por docente
 * dentro da oferta informada. Considera convites com aceito=true e orientacao=false
 * vinculados a TCCs que atendem aos filtros de ano/semestre/curso/fase.
 *
 * Filtros: ano, semestre, id_curso (opcional), fase (opcional)
 */
const contarDefesasAceitasPorDocente = async (filtros) => {
	const { ano, semestre, id_curso, fase } = filtros || {};

	let anoAlvo = ano;
	let semestreAlvo = semestre;

	if (!anoAlvo || !semestreAlvo) {
		const atual = await obterAnoSemestreAtual();
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

	const orientadoresCurso = await model.OrientadorCurso.findAll({
		where: whereOrientadorCurso,
		include: [
			{
				model: model.Docente,
				as: "docente",
				attributes: ["codigo", "nome"],
			},
		],
		raw: true,
		nest: true,
	});

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
	const { fn, col, literal } = model.Sequelize;
	// Montar where do convite (aceito, banca e fase quando informada)
	const conviteWhere = { aceito: true, orientacao: false };
	if (fase) conviteWhere.fase = parseInt(fase);

	const contagens = await model.Convite.findAll({
		attributes: [
			"codigo_docente",
			[
				// Quando a fase não é filtrada, contamos defesas distintas por (id_tcc, fase)
				literal(
					'COUNT(DISTINCT ("Convite"."id_tcc", "Convite"."fase"))',
				),
				"quantidade",
			],
		],
		where: conviteWhere,
		include: [
			{
				model: model.TrabalhoConclusao,
				required: true,
				attributes: [],
				where: tccWhere,
			},
		],
		group: ["codigo_docente"],
		raw: true,
	});

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

module.exports.contarDefesasAceitasPorDocente = contarDefesasAceitasPorDocente;

/**
 * Lista defesas agendadas (data_defesa não nula) agregadas por TCC/horário,
 * com informações para exibição em tabela no dashboard.
 * Retorna itens com: data, hora, fase, estudante, titulo, orientador, banca[]
 * Ordenados por data asc, hora asc, estudante asc.
 * Filtros: ano, semestre, id_curso (opcional), fase (opcional), codigo_docente (opcional)
 */
const listarDefesasAgendadas = async (filtros) => {
	const { ano, semestre, id_curso, fase, codigo_docente } = filtros || {};

	let anoAlvo = ano;
	let semestreAlvo = semestre;

	if (!anoAlvo || !semestreAlvo) {
		const atual = await obterAnoSemestreAtual();
		anoAlvo = atual.ano;
		semestreAlvo = atual.semestre;
	}

	const Op = model.Sequelize.Op;

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
	const defesas = await model.Defesa.findAll({
		where: defesaWhere,
		include: [
			{
				model: model.TrabalhoConclusao,
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
						model: model.Dicente,
						attributes: ["matricula", "nome"],
					},
				],
			},
			{
				model: model.Docente,
				as: "membroBanca",
				attributes: ["codigo", "nome"],
			},
		],
		raw: true,
		nest: true,
	});

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

module.exports.listarDefesasAgendadas = listarDefesasAgendadas;
