const model = require("@backend/models");

// Função para retornar todos os cursos
const retornaTodosCursos = async (req, res) => {
	try {
		const cursos = await model.Curso.findAll();
		res.status(200).json({ cursos: cursos });
	} catch (error) {
		console.log("Erro ao buscar cursos:", error);
		res.sendStatus(500);
	}
};

// Função para criar um novo curso
const criaCurso = async (req, res) => {
	const formData = req.body.formData;
	console.log(formData);
	try {
		const curso = model.Curso.build(formData);
		await curso.save();
		res.sendStatus(200);
	} catch (error) {
		console.log("Erro ao criar curso:", error);
		res.sendStatus(500);
	}
};

// Função para atualizar um curso
const atualizaCurso = async (req, res) => {
	const formData = req.body.formData;
	try {
		await model.Curso.update(formData, { where: { id: formData.id } });
		res.sendStatus(200);
	} catch (error) {
		console.log("Erro ao atualizar curso:", error);
		res.sendStatus(500);
	}
};

// Função para deletar um curso
const deletaCurso = async (req, res) => {
	try {
		const id = req.params.id;
		const deleted = await model.Curso.destroy({
			where: { id: id },
		});

		if (deleted) {
			res.sendStatus(200);
		} else {
			res.status(404).send({ message: "Curso não encontrado" });
		}
	} catch (error) {
		console.error("Erro ao deletar curso:", error);
		res.status(500).send({ message: "Erro ao deletar curso" });
	}
};

module.exports = {
	retornaTodosCursos,
	criaCurso,
	atualizaCurso,
	deletaCurso,
};
