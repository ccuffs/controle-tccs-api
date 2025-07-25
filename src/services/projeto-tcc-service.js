const model = require("@backend/models");

// Função para retornar todos os projetos TCC
const retornaTodosProjetosTcc = async (req, res) => {
	try {
		const projetos = await model.ProjetoTcc.findAll({
			include: [
				{
					model: model.AreaTcc,
					attributes: ['id', 'descicao'],
					include: [
						{
							model: model.Docente,
							attributes: ['codigo', 'nome', 'email']
						}
					]
				},
				{
					model: model.Docente,
					attributes: ['codigo', 'nome', 'email']
				}
			],
			order: [
				[{ model: model.Docente }, 'nome', 'ASC'],
				[{ model: model.AreaTcc }, 'descicao', 'ASC'],
				['descricao', 'ASC']
			]
		});
		res.status(200).json({ projetos: projetos });
	} catch (error) {
		console.log("Erro ao buscar projetos TCC:", error);
		res.sendStatus(500);
	}
};

// Função para retornar projetos TCC por curso (através dos docentes orientadores)
const retornaProjetosTccPorCurso = async (req, res) => {
	try {
		const id_curso = req.params.id_curso;

		// Buscar docentes orientadores do curso
		const orientadores = await model.OrientadorCurso.findAll({
			where: { id_curso: id_curso },
			attributes: ['codigo_docente']
		});

		const codigosDocentes = orientadores.map(o => o.codigo_docente);

		const projetos = await model.ProjetoTcc.findAll({
			where: {
				codigo_docente: codigosDocentes
			},
			include: [
				{
					model: model.AreaTcc,
					attributes: ['id', 'descicao'],
					include: [
						{
							model: model.Docente,
							attributes: ['codigo', 'nome', 'email']
						}
					]
				},
				{
					model: model.Docente,
					attributes: ['codigo', 'nome', 'email']
				}
			],
			order: [
				[{ model: model.Docente }, 'nome', 'ASC'],
				[{ model: model.AreaTcc }, 'descicao', 'ASC'],
				['descricao', 'ASC']
			]
		});
		res.status(200).json({ projetos: projetos });
	} catch (error) {
		console.log("Erro ao buscar projetos TCC do curso:", error);
		res.sendStatus(500);
	}
};

// Função para retornar projetos TCC por docente
const retornaProjetosTccPorDocente = async (req, res) => {
	try {
		const codigo = req.params.codigo;
		const projetos = await model.ProjetoTcc.findAll({
			where: {
				codigo_docente: codigo
			},
			include: [
				{
					model: model.AreaTcc,
					attributes: ['id', 'descicao']
				}
			],
			order: [
				[{ model: model.AreaTcc }, 'descicao', 'ASC'],
				['descricao', 'ASC']
			]
		});
		res.status(200).json({ projetos: projetos });
	} catch (error) {
		console.log("Erro ao buscar projetos TCC do docente:", error);
		res.sendStatus(500);
	}
};

// Função para criar um novo projeto TCC
const criaProjetoTcc = async (req, res) => {
	const formData = req.body.formData;
	try {
		const projeto = model.ProjetoTcc.build(formData);
		await projeto.save();
		res.sendStatus(200);
	} catch (error) {
		console.log("Erro ao criar projeto TCC:", error);
		res.sendStatus(500);
	}
};

// Função para atualizar um projeto TCC
const atualizaProjetoTcc = async (req, res) => {
	const formData = req.body.formData;
	try {
		await model.ProjetoTcc.update(formData, {
			where: { id: formData.id },
		});
		res.sendStatus(200);
	} catch (error) {
		console.log("Erro ao atualizar projeto TCC:", error);
		res.sendStatus(500);
	}
};

// Função para alternar status ativo/inativo de um projeto TCC
const alternaStatusProjetoTcc = async (req, res) => {
	try {
		const id = req.params.id;
		const { ativo } = req.body;

		const updated = await model.ProjetoTcc.update(
			{ ativo: ativo },
			{ where: { id: id } }
		);

		if (updated[0] > 0) {
			res.sendStatus(200);
		} else {
			res.status(404).send({ message: "Projeto TCC não encontrado" });
		}
	} catch (error) {
		console.error("Erro ao alterar status do projeto TCC:", error);
		res.status(500).send({ message: "Erro ao alterar status do projeto TCC" });
	}
};

// Função para deletar um projeto TCC (marcar como inativo)
const deletaProjetoTcc = async (req, res) => {
	try {
		const id = req.params.id;
		const updated = await model.ProjetoTcc.update(
			{ ativo: false },
			{ where: { id: id } }
		);

		if (updated[0] > 0) {
			res.sendStatus(200);
		} else {
			res.status(404).send({ message: "Projeto TCC não encontrado" });
		}
	} catch (error) {
		console.error("Erro ao deletar projeto TCC:", error);
		res.status(500).send({ message: "Erro ao deletar projeto TCC" });
	}
};

module.exports = {
	retornaTodosProjetosTcc,
	retornaProjetosTccPorCurso,
	retornaProjetosTccPorDocente,
	criaProjetoTcc,
	atualizaProjetoTcc,
	alternaStatusProjetoTcc,
	deletaProjetoTcc
};