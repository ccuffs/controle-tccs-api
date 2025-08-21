const ofertasTccRepository = require("../repository/ofertas-tcc-repository");
const { obterAnoSemestreAtual } = require("./ano-semestre-service");

// Função para retornar todas as ofertas de TCC
const retornaTodasOfertasTcc = async (req, res) => {
	try {
		const { ano, semestre, id_curso, fase } = req.query;

		let whereClause = {};

		// Aplicar filtros se fornecidos
		if (ano) whereClause.ano = parseInt(ano);
		if (semestre) whereClause.semestre = parseInt(semestre);
		if (id_curso) whereClause.id_curso = parseInt(id_curso);
		if (fase) whereClause.fase = parseInt(fase);

		const include = [
			{
				model: require("../models").Curso,
				attributes: ["id", "nome", "codigo"],
			},
		];

		const order = [
			["ano", "DESC"],
			["semestre", "DESC"],
			["fase", "ASC"],
		];

		const ofertas = await ofertasTccRepository.buscarOfertasTcc(
			whereClause,
			include,
			order,
		);

		res.status(200).json({ ofertas: ofertas });
	} catch (error) {
		console.log("Erro ao buscar ofertas TCC:", error);
		res.sendStatus(500);
	}
};

// Função para buscar oferta específica
const retornaOfertaTccPorChave = async (req, res) => {
	try {
		const { ano, semestre, id_curso, fase } = req.params;

		const where = {
			ano: parseInt(ano),
			semestre: parseInt(semestre),
			id_curso: parseInt(id_curso),
			fase: parseInt(fase),
		};

		const include = [
			{
				model: require("../models").Curso,
				attributes: ["id", "nome", "codigo"],
			},
		];

		const oferta = await ofertasTccRepository.buscarOfertaTccPorChave(
			where,
			include,
		);

		if (!oferta) {
			return res
				.status(404)
				.json({ message: "Oferta TCC não encontrada" });
		}

		res.status(200).json({ oferta: oferta });
	} catch (error) {
		console.log("Erro ao buscar oferta TCC:", error);
		res.sendStatus(500);
	}
};

// Função para criar uma nova oferta de TCC
const criaOfertaTcc = async (req, res) => {
	const formData = req.body.formData;

	try {
		// Verificar se já existe oferta com a mesma chave
		const where = {
			ano: formData.ano,
			semestre: formData.semestre,
			id_curso: formData.id_curso,
			fase: formData.fase,
		};

		const ofertaExistente =
			await ofertasTccRepository.verificarOfertaExistente(where);

		if (ofertaExistente) {
			return res.status(400).json({
				message:
					"Já existe uma oferta TCC para este período, curso e fase",
			});
		}

		await ofertasTccRepository.criarOfertaTcc(formData);

		res.status(201).json({
			message: "Oferta TCC criada com sucesso",
		});
	} catch (error) {
		console.log("Erro ao criar oferta TCC:", error);
		console.log("Dados que causaram erro:", formData);
		res.status(500).json({ error: error.message });
	}
};

// Função para atualizar uma oferta de TCC
const atualizaOfertaTcc = async (req, res) => {
	const { ano, semestre, id_curso, fase } = req.params;
	const formData = req.body.formData;

	try {
		const where = {
			ano: parseInt(ano),
			semestre: parseInt(semestre),
			id_curso: parseInt(id_curso),
			fase: parseInt(fase),
		};

		const updatedRowsCount = await ofertasTccRepository.atualizarOfertaTcc(
			where,
			formData,
		);

		if (updatedRowsCount === 0) {
			return res
				.status(404)
				.json({ message: "Oferta TCC não encontrada" });
		}

		res.status(200).json({ message: "Oferta TCC atualizada com sucesso" });
	} catch (error) {
		console.log("Erro ao atualizar oferta TCC:", error);
		console.log("Dados que causaram erro:", formData);
		res.status(500).json({ error: error.message });
	}
};

// Função para deletar uma oferta de TCC
const deletaOfertaTcc = async (req, res) => {
	try {
		const { ano, semestre, id_curso, fase } = req.params;

		const where = {
			ano: parseInt(ano),
			semestre: parseInt(semestre),
			id_curso: parseInt(id_curso),
			fase: parseInt(fase),
		};

		// Verificar se há trabalhos de conclusão vinculados a esta oferta
		const trabalhosVinculados =
			await ofertasTccRepository.contarTrabalhosVinculados(where);

		if (trabalhosVinculados > 0) {
			return res.status(400).json({
				message: `Não é possível deletar esta oferta pois existem ${trabalhosVinculados} trabalho(s) de conclusão vinculado(s)`,
			});
		}

		const deleted = await ofertasTccRepository.deletarOfertaTcc(where);

		if (deleted) {
			res.status(200).json({
				message: "Oferta TCC deletada com sucesso",
			});
		} else {
			res.status(404).json({ message: "Oferta TCC não encontrada" });
		}
	} catch (error) {
		console.error("Erro ao deletar oferta TCC:", error);
		res.status(500).json({ message: "Erro ao deletar oferta TCC" });
	}
};

// Função para buscar ofertas ativas (mais recentes)
const retornaOfertasAtivas = async (req, res) => {
	try {
		// Obter ano e semestre atual usando a lógica baseada em ano_semestre
		const { ano: anoAtual, semestre: semestreAtual } =
			await obterAnoSemestreAtual();

		const include = [
			{
				model: require("../models").Curso,
				attributes: ["id", "nome", "codigo"],
			},
		];

		const order = [
			["ano", "DESC"],
			["semestre", "DESC"],
			["fase", "ASC"],
		];

		const ofertas = await ofertasTccRepository.buscarOfertasAtivas(
			anoAtual - 1,
			include,
			order,
		);

		res.status(200).json({ ofertas: ofertas });
	} catch (error) {
		console.log("Erro ao buscar ofertas ativas:", error);
		res.sendStatus(500);
	}
};

// Função para buscar a última oferta TCC
const buscarUltimaOfertaTcc = async (req, res) => {
	try {
		const include = [
			{
				model: require("../models").Curso,
				attributes: ["id", "nome", "codigo"],
			},
		];

		const order = [
			["ano", "DESC"],
			["semestre", "DESC"],
			["fase", "ASC"],
		];

		const ultimaOferta = await ofertasTccRepository.buscarUltimaOfertaTcc(
			include,
			order,
		);

		if (ultimaOferta) {
			res.json(ultimaOferta);
		} else {
			res.status(404).json({
				message: "Nenhuma oferta TCC encontrada",
			});
		}
	} catch (error) {
		console.error("Erro ao buscar última oferta TCC:", error);
		res.status(500).json({ message: "Erro interno do servidor" });
	}
};

module.exports = {
	retornaTodasOfertasTcc,
	retornaOfertaTccPorChave,
	criaOfertaTcc,
	atualizaOfertaTcc,
	deletaOfertaTcc,
	retornaOfertasAtivas,
	buscarUltimaOfertaTcc,
};
