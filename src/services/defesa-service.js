const model = require("../models");

// Função para retornar todas as defesas
const retornaTodasDefesas = async (req, res) => {
	try {
		const { id_tcc, ano, semestre } = req.query;

		let whereClause = {};
		let includeWhere = {};

		// Filtro direto na defesa
		if (id_tcc) whereClause.id_tcc = parseInt(id_tcc);

		// Filtros no TrabalhoConclusao
		if (ano) includeWhere.ano = parseInt(ano);
		if (semestre) includeWhere.semestre = parseInt(semestre);

		const defesas = await model.Defesa.findAll({
			where: whereClause,
			include: [
				{
					model: model.TrabalhoConclusao,
					where:
						Object.keys(includeWhere).length > 0
							? includeWhere
							: undefined,
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
					as: "membroBancaA",
					attributes: ["codigo", "nome", "email"],
				},
				{
					model: model.Docente,
					as: "membroBancaB",
					attributes: ["codigo", "nome", "email"],
				},
			],
			order: [["data_defesa", "DESC"]],
		});

		res.status(200).json({ defesas: defesas });
	} catch (error) {
		console.log("Erro ao buscar defesas:", error);
		res.sendStatus(500);
	}
};

// Função para buscar defesa específica por ID do TCC
const retornaDefesaPorTcc = async (req, res) => {
	try {
		const { id_tcc } = req.params;

		const defesa = await model.Defesa.findOne({
			where: { id_tcc: id_tcc },
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
					as: "membroBancaA",
					attributes: ["codigo", "nome", "email"],
				},
				{
					model: model.Docente,
					as: "membroBancaB",
					attributes: ["codigo", "nome", "email"],
				},
			],
		});

		if (!defesa) {
			return res.status(404).json({ message: "Defesa não encontrada" });
		}

		res.status(200).json({ defesa: defesa });
	} catch (error) {
		console.log("Erro ao buscar defesa:", error);
		res.sendStatus(500);
	}
};

// Função para criar uma nova defesa
const criaDefesa = async (req, res) => {
	const formData = req.body.formData;

	try {
		// Verificar se já existe defesa para este TCC
		const defesaExistente = await model.Defesa.findOne({
			where: { id_tcc: formData.id_tcc },
		});

		if (defesaExistente) {
			return res.status(400).json({
				message: "Já existe uma defesa agendada para este TCC",
			});
		}

		// Verificar se os membros da banca são diferentes
		if (formData.membro_banca_a === formData.membro_banca_b) {
			return res.status(400).json({
				message: "Os membros da banca devem ser diferentes",
			});
		}

		const defesa = model.Defesa.build(formData);
		await defesa.save();

		res.status(201).json({
			message: "Defesa criada com sucesso",
		});
	} catch (error) {
		console.log("Erro ao criar defesa:", error);
		console.log("Dados que causaram erro:", formData);
		res.status(500).json({ error: error.message });
	}
};

// Função para atualizar uma defesa
const atualizaDefesa = async (req, res) => {
	const { id_tcc, membro_banca_a, membro_banca_b } = req.params;
	const formData = req.body.formData;

	try {
		const [updatedRowsCount] = await model.Defesa.update(formData, {
			where: {
				id_tcc: id_tcc,
				membro_banca_a: membro_banca_a,
				membro_banca_b: membro_banca_b,
			},
		});

		if (updatedRowsCount === 0) {
			return res.status(404).json({ message: "Defesa não encontrada" });
		}

		res.status(200).json({ message: "Defesa atualizada com sucesso" });
	} catch (error) {
		console.log("Erro ao atualizar defesa:", error);
		console.log("Dados que causaram erro:", formData);
		res.status(500).json({ error: error.message });
	}
};

// Função para registrar avaliação da defesa
const registraAvaliacaoDefesa = async (req, res) => {
	const { id_tcc } = req.params;
	const { avaliacao } = req.body;

	try {
		const [updatedRowsCount] = await model.Defesa.update(
			{ avaliacao: avaliacao },
			{ where: { id_tcc: id_tcc } },
		);

		if (updatedRowsCount === 0) {
			return res.status(404).json({ message: "Defesa não encontrada" });
		}

		res.status(200).json({ message: "Avaliação registrada com sucesso" });
	} catch (error) {
		console.log("Erro ao registrar avaliação:", error);
		res.status(500).json({ error: error.message });
	}
};

// Função para deletar uma defesa
const deletaDefesa = async (req, res) => {
	try {
		const { id_tcc, membro_banca_a, membro_banca_b } = req.params;

		const deleted = await model.Defesa.destroy({
			where: {
				id_tcc: id_tcc,
				membro_banca_a: membro_banca_a,
				membro_banca_b: membro_banca_b,
			},
		});

		if (deleted) {
			res.status(200).json({ message: "Defesa deletada com sucesso" });
		} else {
			res.status(404).json({ message: "Defesa não encontrada" });
		}
	} catch (error) {
		console.error("Erro ao deletar defesa:", error);
		res.status(500).json({ message: "Erro ao deletar defesa" });
	}
};

module.exports = {
	retornaTodasDefesas,
	retornaDefesaPorTcc,
	criaDefesa,
	atualizaDefesa,
	registraAvaliacaoDefesa,
	deletaDefesa,
};
