const datasDefesaRepository = require("../repository/datas-defesa-repository");

// Função para retornar todas as datas de defesa
const retornaTodasDatasDefesa = async (req, res) => {
	try {
		const { ano, semestre, id_curso, fase } = req.query;
		const filtros = { ano, semestre, id_curso, fase };

		const datasDefesa =
			await datasDefesaRepository.obterTodasDatasDefesa(filtros);
		res.status(200).json({ datasDefesa: datasDefesa });
	} catch (error) {
		console.log("Erro ao buscar datas de defesa:", error);
		res.sendStatus(500);
	}
};

// Função para buscar datas de defesa por oferta específica
const retornaDatasDefesaPorOferta = async (req, res) => {
	try {
		const { ano, semestre, id_curso, fase } = req.params;

		const datasDefesa =
			await datasDefesaRepository.obterDatasDefesaPorOferta(
				ano,
				semestre,
				id_curso,
				fase,
			);

		if (!datasDefesa) {
			return res
				.status(404)
				.json({ message: "Datas de defesa não encontradas" });
		}

		res.status(200).json({ datasDefesa: datasDefesa });
	} catch (error) {
		console.log("Erro ao buscar datas de defesa:", error);
		res.sendStatus(500);
	}
};

// Função para criar nova data de defesa
const criaDataDefesa = async (req, res) => {
	try {
		const dadosDataDefesa = req.body;

		// Validações básicas
		if (
			!dadosDataDefesa.ano ||
			!dadosDataDefesa.semestre ||
			!dadosDataDefesa.id_curso ||
			!dadosDataDefesa.fase
		) {
			return res.status(400).json({
				message: "Ano, semestre, id_curso e fase são obrigatórios",
			});
		}

		const novaDataDefesa =
			await datasDefesaRepository.criarDataDefesa(dadosDataDefesa);
		res.status(201).json({ datasDefesa: novaDataDefesa });
	} catch (error) {
		console.log("Erro ao criar data de defesa:", error);
		res.status(500).json({ message: "Erro ao criar data de defesa" });
	}
};

// Função para atualizar data de defesa
const atualizaDataDefesa = async (req, res) => {
	try {
		const { ano, semestre, id_curso, fase } = req.params;
		const dadosDataDefesa = req.body;

		const atualizada = await datasDefesaRepository.atualizarDataDefesa(
			ano,
			semestre,
			id_curso,
			fase,
			dadosDataDefesa,
		);

		if (atualizada) {
			res.status(200).json({
				message: "Data de defesa atualizada com sucesso",
			});
		} else {
			res.status(404).json({ message: "Data de defesa não encontrada" });
		}
	} catch (error) {
		console.log("Erro ao atualizar data de defesa:", error);
		res.status(500).json({ message: "Erro ao atualizar data de defesa" });
	}
};

// Função para deletar data de defesa
const deletaDataDefesa = async (req, res) => {
	try {
		const { ano, semestre, id_curso, fase } = req.params;

		const deleted = await datasDefesaRepository.deletarDataDefesa(
			ano,
			semestre,
			id_curso,
			fase,
		);

		if (deleted) {
			res.status(200).json({
				message: "Data de defesa deletada com sucesso",
			});
		} else {
			res.status(404).json({ message: "Data de defesa não encontrada" });
		}
	} catch (error) {
		console.log("Erro ao deletar data de defesa:", error);
		res.status(500).json({ message: "Erro ao deletar data de defesa" });
	}
};

module.exports = {
	retornaTodasDatasDefesa,
	retornaDatasDefesaPorOferta,
	criaDataDefesa,
	atualizaDataDefesa,
	deletaDataDefesa,
};
