const model = require("../models");

// Função para retornar todos os trabalhos de conclusão
const retornaTodosTrabalhosConlusao = async (req, res) => {
	try {
		const { ano, semestre, id_curso, fase, matricula, etapa } = req.query;

		let whereClause = {};

		// Aplicar filtros se fornecidos
		if (ano) whereClause.ano = parseInt(ano);
		if (semestre) whereClause.semestre = parseInt(semestre);
		if (id_curso) whereClause.id_curso = parseInt(id_curso);
		if (fase) whereClause.fase = parseInt(fase);
		if (matricula) whereClause.matricula = parseInt(matricula);
		if (etapa) whereClause.etapa = parseInt(etapa);

		const trabalhos = await model.TrabalhoConclusao.findAll({
			where: whereClause,
			include: [
				{
					model: model.Dicente,
					attributes: ['matricula', 'nome', 'email']
				},
				{
					model: model.Curso,
					attributes: ['id', 'nome', 'codigo']
				},
				{
					model: model.Orientacao,
					include: [
						{
							model: model.Docente,
							attributes: ['codigo', 'nome', 'email']
						}
					]
				},
				{
					model: model.Defesa,
					required: false
				}
			],
			order: [['ano', 'DESC'], ['semestre', 'DESC'], ['id', 'DESC']]
		});

		res.status(200).json({ trabalhos: trabalhos });
	} catch (error) {
		console.log("Erro ao buscar trabalhos de conclusão:", error);
		res.sendStatus(500);
	}
};

// Função para buscar trabalho específico por ID
const retornaTrabalhoConlusaoPorId = async (req, res) => {
	try {
		const { id } = req.params;

		const trabalho = await model.TrabalhoConclusao.findByPk(id, {
			include: [
				{
					model: model.Dicente,
					attributes: ['matricula', 'nome', 'email']
				},
				{
					model: model.Curso,
					attributes: ['id', 'nome', 'codigo']
				},
				{
					model: model.Orientacao,
					include: [
						{
							model: model.Docente,
							attributes: ['codigo', 'nome', 'email']
						}
					]
				},
				{
					model: model.Convite
				},
				{
					model: model.Defesa,
					include: [
						{
							model: model.Docente,
							as: 'membroBancaA',
							attributes: ['codigo', 'nome', 'email']
						},
						{
							model: model.Docente,
							as: 'membroBancaB', 
							attributes: ['codigo', 'nome', 'email']
						}
					]
				}
			]
		});

		if (!trabalho) {
			return res.status(404).json({ message: "Trabalho de conclusão não encontrado" });
		}

		res.status(200).json({ trabalho: trabalho });
	} catch (error) {
		console.log("Erro ao buscar trabalho de conclusão:", error);
		res.sendStatus(500);
	}
};

// Função para criar um novo trabalho de conclusão
const criaTrabalhoConlusao = async (req, res) => {
	const formData = req.body.formData;

	try {
		const trabalho = model.TrabalhoConclusao.build(formData);
		await trabalho.save();

		res.status(201).json({ 
			message: "Trabalho de conclusão criado com sucesso",
			id: trabalho.id 
		});
	} catch (error) {
		console.log("Erro ao criar trabalho de conclusão:", error);
		console.log("Dados que causaram erro:", formData);
		res.status(500).json({ error: error.message });
	}
};

// Função para atualizar um trabalho de conclusão
const atualizaTrabalhoConlusao = async (req, res) => {
	const { id } = req.params;
	const formData = req.body.formData;

	try {
		const [updatedRowsCount] = await model.TrabalhoConclusao.update(formData, {
			where: { id: id }
		});

		if (updatedRowsCount === 0) {
			return res.status(404).json({ message: "Trabalho de conclusão não encontrado" });
		}

		res.status(200).json({ message: "Trabalho de conclusão atualizado com sucesso" });
	} catch (error) {
		console.log("Erro ao atualizar trabalho de conclusão:", error);
		console.log("Dados que causaram erro:", formData);
		res.status(500).json({ error: error.message });
	}
};

// Função para deletar um trabalho de conclusão
const deletaTrabalhoConlusao = async (req, res) => {
	try {
		const { id } = req.params;
		
		const deleted = await model.TrabalhoConclusao.destroy({
			where: { id: id }
		});

		if (deleted) {
			res.status(200).json({ message: "Trabalho de conclusão deletado com sucesso" });
		} else {
			res.status(404).json({ message: "Trabalho de conclusão não encontrado" });
		}
	} catch (error) {
		console.error("Erro ao deletar trabalho de conclusão:", error);
		res.status(500).json({ message: "Erro ao deletar trabalho de conclusão" });
	}
};

// Função para atualizar etapa do trabalho
const atualizaEtapaTrabalho = async (req, res) => {
	const { id } = req.params;
	const { etapa } = req.body;

	try {
		const [updatedRowsCount] = await model.TrabalhoConclusao.update(
			{ etapa: etapa },
			{ where: { id: id } }
		);

		if (updatedRowsCount === 0) {
			return res.status(404).json({ message: "Trabalho de conclusão não encontrado" });
		}

		res.status(200).json({ message: "Etapa atualizada com sucesso" });
	} catch (error) {
		console.log("Erro ao atualizar etapa:", error);
		res.status(500).json({ error: error.message });
	}
};

module.exports = {
	retornaTodosTrabalhosConlusao,
	retornaTrabalhoConlusaoPorId,
	criaTrabalhoConlusao,
	atualizaTrabalhoConlusao,
	deletaTrabalhoConlusao,
	atualizaEtapaTrabalho
}; 