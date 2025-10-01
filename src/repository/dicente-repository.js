const model = require("@backend/models");
const dicenteRepository = {};

// Buscar todos os dicentes
dicenteRepository.obterTodosDicentes = async () => {
	const dicentes = await model.Dicente.findAll({
		order: [["nome", "ASC"]],
	});
	return dicentes;
};

// Buscar dicentes com filtros de TCC
dicenteRepository.obterDicentesComFiltrosTcc = async (filtros) => {
	const { ano, semestre, fase, id_curso, etapa } = filtros;

	// Constrói a cláusula WHERE para o trabalho de conclusão
	const trabalhoWhere = {};

	if (ano) {
		trabalhoWhere.ano = parseInt(ano);
	}

	if (semestre) {
		trabalhoWhere.semestre = parseInt(semestre);
	}

	if (fase) {
		trabalhoWhere.fase = parseInt(fase);
	}

	if (id_curso) {
		trabalhoWhere.id_curso = parseInt(id_curso);
	}

	if (etapa) {
		trabalhoWhere.etapa = parseInt(etapa);
	}

	// Busca dicentes que possuem trabalho de conclusão com os critérios especificados
	const dicentes = await model.Dicente.findAll({
		include: [
			{
				model: model.TrabalhoConclusao,
				where: trabalhoWhere,
				required: true, // INNER JOIN - só dicentes com TCC
				include: [
					{
						model: model.Curso,
						attributes: ["id", "nome", "codigo"],
					},
				],
			},
		],
		order: [["nome", "ASC"]],
	});

	return dicentes;
};

// Buscar dicente por matrícula
dicenteRepository.obterDicentePorMatricula = async (matricula) => {
	const dicente = await model.Dicente.findByPk(matricula, {
		include: [
			{
				model: model.TrabalhoConclusao,
				include: [
					{
						model: model.Curso,
						attributes: ["id", "nome", "codigo"],
					},
					{
						model: model.Orientacao,
						include: [
							{
								model: model.Docente,
								attributes: [
									"codigo",
									"nome",
									"email",
									"siape",
								],
							},
						],
					},
					{
						model: model.Defesa,
						required: false,
					},
				],
			},
		],
	});
	return dicente;
};

// Buscar dicente por id_usuario
dicenteRepository.obterDicentePorUsuario = async (id_usuario) => {
	const dicente = await model.Dicente.findOne({
		where: { id_usuario: id_usuario },
		include: [
			{
				model: model.TrabalhoConclusao,
				include: [
					{
						model: model.Curso,
						attributes: ["id", "nome", "codigo"],
					},
					{
						model: model.Orientacao,
						include: [
							{
								model: model.Docente,
								attributes: [
									"codigo",
									"nome",
									"email",
									"siape",
								],
							},
						],
					},
					{
						model: model.Defesa,
						required: false,
					},
				],
			},
		],
	});
	return dicente;
};

// Verificar se dicente existe por matrícula
dicenteRepository.verificarDicenteExiste = async (matricula) => {
	const dicente = await model.Dicente.findByPk(matricula);
	return dicente !== null;
};

// Criar novo dicente
dicenteRepository.criarDicente = async (dadosDicente) => {
	const dicente = model.Dicente.build(dadosDicente);
	await dicente.save();
	return dicente;
};

// Atualizar dicente
dicenteRepository.atualizarDicente = async (matricula, dadosDicente) => {
	const [linhasAfetadas] = await model.Dicente.update(dadosDicente, {
		where: { matricula: matricula },
	});
	return linhasAfetadas > 0;
};

// Deletar dicente
dicenteRepository.deletarDicente = async (matricula) => {
	const deleted = await model.Dicente.destroy({
		where: { matricula: matricula },
	});
	return deleted > 0;
};

// Criar múltiplos dicentes
dicenteRepository.criarMultiplosDicentes = async (dicentes) => {
	const dicentesCriados = await model.Dicente.bulkCreate(dicentes, {
		ignoreDuplicates: true,
	});
	return dicentesCriados;
};

module.exports = dicenteRepository;
