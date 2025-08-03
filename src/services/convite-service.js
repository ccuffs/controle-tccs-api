const conviteRepository = require("../repository/convite-repository");

// Função para retornar todos os convites
const retornaTodosConvites = async (req, res) => {
	try {
		const { id_tcc, codigo_docente, aceito } = req.query;
		const filtros = { id_tcc, codigo_docente, aceito };

		const convites = await conviteRepository.obterTodosConvites(filtros);
		res.status(200).json({ convites: convites });
	} catch (error) {
		console.log("Erro ao buscar convites:", error);
		res.sendStatus(500);
	}
};

// Função para criar um novo convite
const criaConvite = async (req, res) => {
	const formData = req.body.formData;

	try {
		// Verificar se já existe convite para este TCC e docente
		const conviteExiste = await conviteRepository.verificarConviteExiste(
			formData.id_tcc,
			formData.codigo_docente,
		);

		if (conviteExiste) {
			return res.status(400).json({
				message: "Já existe um convite para este docente neste TCC",
			});
		}

		// Preparar dados do convite
		const dadosConvite = {
			id_tcc: formData.id_tcc,
			codigo_docente: formData.codigo_docente,
			data_envio: new Date(),
			mensagem_envio: formData.mensagem_envio || "Convite para orientação de TCC",
			aceito: false,
			mensagem_feedback: "",
			orientacao: true,
		};

		const convite = await conviteRepository.criarConvite(dadosConvite);

		res.status(201).json({
			message: "Convite criado com sucesso",
		});
	} catch (error) {
		console.log("Erro ao criar convite:", error);
		console.log("Dados que causaram erro:", formData);
		res.status(500).json({ error: error.message });
	}
};

// Função para aceitar/rejeitar um convite
const respondeConvite = async (req, res) => {
	const { id, codigo_docente } = req.params;
	const { aceito } = req.body;

	try {
		const updateData = { 
			aceito: aceito,
			data_feedback: new Date()
		};

		const sucesso = await conviteRepository.atualizarConvite(
			id,
			codigo_docente,
			updateData,
		);

		if (sucesso) {
			res.status(200).json({
				message: `Convite ${
					aceito ? "aceito" : "rejeitado"
				} com sucesso`,
			});
		} else {
			res.status(404).json({ message: "Convite não encontrado" });
		}
	} catch (error) {
		console.log("Erro ao responder convite:", error);
		res.status(500).json({ error: error.message });
	}
};

// Função para deletar um convite
const deletaConvite = async (req, res) => {
	try {
		const { id, codigo_docente } = req.params;
		const sucesso = await conviteRepository.deletarConvite(
			id,
			codigo_docente,
		);

		if (sucesso) {
			res.sendStatus(200);
		} else {
			res.status(404).send({ message: "Convite não encontrado" });
		}
	} catch (error) {
		console.error("Erro ao deletar convite:", error);
		res.status(500).send({ message: "Erro ao deletar convite" });
	}
};

// Função para retornar convites pendentes de um docente
const retornaConvitesPendentesDocente = async (req, res) => {
	try {
		const { codigo } = req.params;
		const convites = await conviteRepository.obterConvitesPendentesDocente(
			codigo,
		);
		res.status(200).json({ convites: convites });
	} catch (error) {
		console.log("Erro ao buscar convites pendentes do docente:", error);
		res.sendStatus(500);
	}
};

module.exports = {
	retornaTodosConvites,
	criaConvite,
	respondeConvite,
	deletaConvite,
	retornaConvitesPendentesDocente,
};
