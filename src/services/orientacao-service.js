const orientacaoRepository = require("../repository/orientacao-repository");

// Função para retornar todas as orientações
const retornaTodasOrientacoes = async (req, res) => {
	try {
		const { id_tcc, codigo_docente, orientador } = req.query;
		const filtros = { id_tcc, codigo_docente, orientador };

		const orientacoes =
			await orientacaoRepository.obterTodasOrientacoes(filtros);
		res.status(200).json({ orientacoes: orientacoes });
	} catch (error) {
		console.log("Erro ao buscar orientações:", error);
		res.sendStatus(500);
	}
};

// Função para buscar orientações de um TCC específico
const retornaOrientacoesPorTcc = async (req, res) => {
	try {
		const { id_tcc } = req.params;

		const orientacoes =
			await orientacaoRepository.obterOrientacoesPorTcc(id_tcc);
		res.status(200).json({ orientacoes: orientacoes });
	} catch (error) {
		console.log("Erro ao buscar orientações do TCC:", error);
		res.sendStatus(500);
	}
};

// Função para criar uma nova orientação
const criaOrientacao = async (req, res) => {
	const formData = req.body.formData;

	try {
		// Verificar se já existe orientação deste docente para este TCC
		const orientacaoExiste =
			await orientacaoRepository.verificarOrientacaoExiste(
				formData.codigo_docente,
				formData.id_tcc,
			);

		if (orientacaoExiste) {
			return res.status(400).json({
				message: "Este docente já possui orientação para este TCC",
			});
		}

		// Se está marcando como orientador, verificar se já existe um orientador
		if (formData.orientador) {
			const orientadorExiste =
				await orientacaoRepository.verificarOrientadorExiste(
					formData.id_tcc,
				);

			if (orientadorExiste) {
				return res.status(400).json({
					message: "Este TCC já possui um orientador principal",
				});
			}
		}

		const orientacao = await orientacaoRepository.criarOrientacao(formData);

		res.status(201).json({
			message: "Orientação criada com sucesso",
			id: orientacao.id,
		});
	} catch (error) {
		console.log("Erro ao criar orientação:", error);
		console.log("Dados que causaram erro:", formData);
		res.status(500).json({ error: error.message });
	}
};

// Função para atualizar uma orientação
const atualizaOrientacao = async (req, res) => {
	const { id } = req.params;
	const formData = req.body.formData;

	try {
		// Se está alterando para orientador, verificar se já existe outro orientador
		if (formData.orientador) {
			const orientacaoAtual =
				await orientacaoRepository.obterOrientacaoPorId(id);
			if (!orientacaoAtual) {
				return res
					.status(404)
					.json({ message: "Orientação não encontrada" });
			}

			if (!orientacaoAtual.orientador) {
				// Se não era orientador antes
				const outroOrientadorExiste =
					await orientacaoRepository.verificarOutroOrientadorExiste(
						orientacaoAtual.id_tcc,
						id,
					);

				if (outroOrientadorExiste) {
					return res.status(400).json({
						message: "Este TCC já possui um orientador principal",
					});
				}
			}
		}

		const sucesso = await orientacaoRepository.atualizarOrientacao(
			id,
			formData,
		);

		if (sucesso) {
			res.status(200).json({
				message: "Orientação atualizada com sucesso",
			});
		} else {
			res.status(404).json({ message: "Orientação não encontrada" });
		}
	} catch (error) {
		console.log("Erro ao atualizar orientação:", error);
		console.log("Dados que causaram erro:", formData);
		res.status(500).json({ error: error.message });
	}
};

// Função para deletar uma orientação
const deletaOrientacao = async (req, res) => {
	try {
		const { id } = req.params;

		const sucesso = await orientacaoRepository.deletarOrientacao(id);

		if (sucesso) {
			res.status(200).json({
				message: "Orientação deletada com sucesso",
			});
		} else {
			res.status(404).json({ message: "Orientação não encontrada" });
		}
	} catch (error) {
		console.error("Erro ao deletar orientação:", error);
		res.status(500).json({ message: "Erro ao deletar orientação" });
	}
};

module.exports = {
	retornaTodasOrientacoes,
	retornaOrientacoesPorTcc,
	criaOrientacao,
	atualizaOrientacao,
	deletaOrientacao,
};
