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
 * Filtros: ano, semestre, id_curso (opcional), fase (default 1)
 */
const contarTccPorEtapa = async (filtros) => {
	const { ano, semestre, id_curso, fase } = filtros || {};

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
				model.Sequelize.fn("COUNT", model.Sequelize.col("id")),
				"quantidade",
			],
		],
		where,
		group: ["etapa"],
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
 * Filtros: ano, semestre, id_curso (opcional), fase (default 1)
 */
const contarConvitesPorPeriodo = async (filtros) => {
	const { ano, semestre, id_curso, fase } = filtros || {};

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
		inicio: inicioPeriodo,
		fim: fimPeriodo,
		pontos,
	};
};

module.exports.contarConvitesPorPeriodo = contarConvitesPorPeriodo;

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

	// Montar where do TCC para filtrar os convites aceitos da oferta
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
	const { fn, col } = model.Sequelize;
	const contagens = await model.Convite.findAll({
		attributes: [
			"codigo_docente",
			[fn("COUNT", fn("DISTINCT", col("Convite.id_tcc"))), "quantidade"],
		],
		where: { aceito: true, orientacao: false },
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
