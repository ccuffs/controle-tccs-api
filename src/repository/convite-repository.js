const model = require("@backend/models");
const conviteRepository = {};

// Buscar todos os convites com filtros
conviteRepository.obterTodosConvites = async (filtros) => {
	const { id_tcc, codigo_docente, aceito } = filtros;

	console.log("Filtros recebidos no repository:", filtros);

	let whereClause = {};

	// Aplicar filtros se fornecidos
	if (id_tcc) whereClause.id_tcc = parseInt(id_tcc);
	if (codigo_docente) whereClause.codigo_docente = codigo_docente;
	if (aceito !== undefined) whereClause.aceito = aceito === "true";

	console.log("Where clause construída:", whereClause);

	const convites = await model.Convite.findAll({
		where: whereClause,
		include: [
			{
				model: model.TrabalhoConclusao,
				include: [
					{
						model: model.Dicente,
						attributes: ["matricula", "nome", "email"],
					},
					{
						model: model.Curso,
						attributes: ["id", "nome", "codigo"],
					},
				],
			},
			{
				model: model.Docente,
				attributes: ["codigo", "nome", "email"],
			},
		],
		order: [["data_envio", "DESC"]],
	});

	console.log("Convites encontrados no banco:", convites);
	console.log("Quantidade de convites:", convites.length);

	return convites;
};

// Buscar convite por ID e docente
conviteRepository.obterConvitePorIdEDocente = async (idTcc, codigoDocente) => {
	const convite = await model.Convite.findOne({
		where: {
			id_tcc: idTcc,
			codigo_docente: codigoDocente,
		},
		include: [
			{
				model: model.Docente,
				attributes: ["codigo", "nome", "email"],
			},
		],
	});
	return convite;
};

// Verificar se convite existe
conviteRepository.verificarConviteExiste = async (idTcc, codigoDocente) => {
	const convite = await model.Convite.findOne({
		where: {
			id_tcc: idTcc,
			codigo_docente: codigoDocente,
		},
	});
	return convite !== null;
};

// Criar novo convite
conviteRepository.criarConvite = async (dadosConvite) => {
	const convite = model.Convite.build(dadosConvite);
	await convite.save();
	return convite;
};

// Atualizar convite
conviteRepository.atualizarConvite = async (
	idTcc,
	codigoDocente,
	dadosConvite,
) => {
	console.log("Repository - Atualizar convite:", {
		idTcc,
		codigoDocente,
		dadosConvite,
	});

	const [linhasAfetadas] = await model.Convite.update(dadosConvite, {
		where: {
			id_tcc: idTcc,
			codigo_docente: codigoDocente,
		},
	});

	console.log("Repository - Linhas afetadas:", linhasAfetadas);
	return linhasAfetadas > 0;
};

// Deletar convite
conviteRepository.deletarConvite = async (idTcc, codigoDocente) => {
	const deleted = await model.Convite.destroy({
		where: {
			id_tcc: idTcc,
			codigo_docente: codigoDocente,
		},
	});
	return deleted > 0;
};

// Buscar convites do docente
conviteRepository.obterConvitesDocente = async (codigoDocente) => {
	const convites = await model.Convite.findAll({
		where: {
			codigo_docente: codigoDocente,
		},
		include: [
			{
				model: model.TrabalhoConclusao,
				include: [
					{
						model: model.Dicente,
						attributes: ["matricula", "nome", "email"],
					},
					{
						model: model.Curso,
						attributes: ["id", "nome", "codigo"],
					},
				],
			},
			{
				model: model.Docente,
				attributes: ["codigo", "nome", "email"],
			},
		],
		order: [["data_envio", "DESC"]],
	});
	return convites;
};

// Buscar trabalho de conclusão por ID
conviteRepository.obterTrabalhoConclusaoPorId = async (idTcc) => {
	const trabalhoConclusao = await model.TrabalhoConclusao.findOne({
		where: {
			id: idTcc,
		},
		attributes: ["id", "ano", "semestre", "id_curso", "fase"],
	});
	return trabalhoConclusao;
};

module.exports = conviteRepository;
