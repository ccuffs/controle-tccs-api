const defesaRepository = require("../repository/defesa-repository");

// Função para retornar todas as defesas
const retornaTodasDefesas = async (req, res) => {
	try {
		const { id_tcc, ano, semestre } = req.query;
		const filtros = { id_tcc, ano, semestre };

		const defesas = await defesaRepository.obterTodasDefesas(filtros);
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

		const defesa = await defesaRepository.obterDefesaPorTcc(id_tcc);

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
		const defesaExiste = await defesaRepository.verificarDefesaExiste(
			formData.id_tcc,
		);

		if (defesaExiste) {
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

		const defesa = await defesaRepository.criarDefesa(formData);

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
		const sucesso = await defesaRepository.atualizarDefesa(
			id_tcc,
			membro_banca_a,
			membro_banca_b,
			formData,
		);

		if (sucesso) {
			res.status(200).json({ message: "Defesa atualizada com sucesso" });
		} else {
			res.status(404).json({ message: "Defesa não encontrada" });
		}
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
		const sucesso = await defesaRepository.registrarAvaliacaoDefesa(
			id_tcc,
			avaliacao,
		);

		if (sucesso) {
			res.status(200).json({
				message: "Avaliação registrada com sucesso",
			});
		} else {
			res.status(404).json({ message: "Defesa não encontrada" });
		}
	} catch (error) {
		console.log("Erro ao registrar avaliação:", error);
		res.status(500).json({ error: error.message });
	}
};

// Função para deletar uma defesa
const deletaDefesa = async (req, res) => {
	try {
		const { id_tcc, membro_banca_a, membro_banca_b } = req.params;

		const sucesso = await defesaRepository.deletarDefesa(
			id_tcc,
			membro_banca_a,
			membro_banca_b,
		);

		if (sucesso) {
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
