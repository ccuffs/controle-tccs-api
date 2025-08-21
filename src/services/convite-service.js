const conviteRepository = require("../repository/convite-repository");
const docenteRepository = require("../repository/docente-repository");
const temaTccRepository = require("../repository/tema-tcc-repository");
const orientacaoRepository = require("../repository/orientacao-repository");
const model = require("@backend/models");

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
	console.log(formData);

	try {
		// Verificar se já existe convite para este TCC e docente
		const conviteExiste = await conviteRepository.verificarConviteExiste(
			formData.id_tcc,
			formData.codigo_docente,
			formData.fase,
		);

		if (conviteExiste) {
			return res.status(400).json({
				message: "Já existe um convite para este docente neste TCC",
			});
		}

		console.log("formData", formData);

		// Preparar dados do convite
		const dadosConvite = {
			id_tcc: formData.id_tcc,
			codigo_docente: formData.codigo_docente,
			data_envio: new Date(),
			mensagem_envio:
				formData.mensagem_envio || "Convite para orientação de TCC",
			aceito: formData.orientacao || false,
			mensagem_feedback: formData.mensagem_feedback || "",
			data_feedback: formData.data_feedback || undefined,
			orientacao:
				formData.orientacao === undefined ? true : formData.orientacao, // Usar valor do frontend ou true como padrão
			fase: formData.fase === undefined ? 1 : formData.fase, // Usar valor do frontend ou 1 como padrão
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
	const { id, codigo_docente, fase } = req.params;
	const { aceito } = req.body;

	// Iniciar transação para garantir atomicidade
	const transaction = await model.sequelize.transaction();

	try {
		const updateData = {
			aceito: aceito,
			data_feedback: new Date(),
			mensagem_feedback: aceito ? "Convite aceito" : "Convite rejeitado",
		};

		const sucesso = await conviteRepository.atualizarConvite(
			id,
			codigo_docente,
			fase,
			updateData,
			transaction,
		);

		if (sucesso) {
			// Se o convite foi aceito e é um convite de orientação, inserir na tabela de orientação
			const conviteInfo =
				await conviteRepository.obterConvitePorIdEDocente(
					id,
					codigo_docente,
					fase,
				);
			if (aceito && conviteInfo && conviteInfo.orientacao === true) {
				// Verificar se já existe orientação para este TCC e docente
				const orientacaoExiste =
					await orientacaoRepository.verificarOrientacaoExiste(
						codigo_docente,
						id,
						transaction,
					);

				if (!orientacaoExiste) {
					// Verificar se já existe um orientador para este TCC
					const orientadorExiste =
						await orientacaoRepository.verificarOrientadorExiste(
							id,
							transaction,
						);

					// Criar nova orientação
					const dadosOrientacao = {
						codigo_docente: codigo_docente,
						id_tcc: parseInt(id),
						orientador: !orientadorExiste, // Se não existe orientador, este será o orientador
					};

					await orientacaoRepository.criarOrientacao(
						dadosOrientacao,
						transaction,
					);
				}

				// Atualizar as vagas na docente_oferta
				try {
					// Buscar o trabalho de conclusão para obter as informações necessárias
					const trabalhoConclusao =
						await conviteRepository.obterTrabalhoConclusaoPorId(id);

					if (trabalhoConclusao) {
						const { ano, semestre, id_curso, fase } =
							trabalhoConclusao;

						// Buscar a oferta atual do docente
						const docenteOferta =
							await temaTccRepository.buscarOfertaDocente(
								ano,
								semestre,
								id_curso,
								codigo_docente,
								fase,
							);

						if (docenteOferta && docenteOferta.vagas > 0) {
							// Reduzir uma vaga
							const novasVagas = docenteOferta.vagas - 1;
							await docenteOferta.update({ vagas: novasVagas });
						}
					}
				} catch (error) {
					console.log(
						"Erro ao atualizar vagas na docente_oferta:",
						error,
					);
					// Não falhar a operação principal se a atualização de vagas falhar
				}
			}

			// Commit da transação
			await transaction.commit();

			res.status(200).json({
				message: `Convite ${
					aceito ? "aceito" : "rejeitado"
				} com sucesso`,
			});
		} else {
			// Rollback da transação
			await transaction.rollback();
			res.status(404).json({ message: "Convite não encontrado" });
		}
	} catch (error) {
		// Rollback da transação em caso de erro
		await transaction.rollback();
		console.log("Erro ao responder convite:", error);
		res.status(500).json({ error: error.message });
	}
};

// Função para deletar um convite
const deletaConvite = async (req, res) => {
	try {
		const { id, codigo_docente, fase } = req.params;
		const sucesso = await conviteRepository.deletarConvite(
			id,
			codigo_docente,
			fase,
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

// Função para retornar convites de um docente
const retornaConvitesDocente = async (req, res) => {
	try {
		const { codigo } = req.params;

		// Primeiro, buscar o docente pelo ID do usuário
		const docente = await docenteRepository.obterDocentePorUsuario(codigo);

		if (!docente) {
			return res.status(404).json({
				message: "Docente não encontrado para este usuário",
			});
		}

		// Agora buscar os convites usando o codigo_docente
		const convites = await conviteRepository.obterConvitesDocente(
			docente.codigo,
		);

		// Retorna os convites encontrados
		res.status(200).json({
			convites: convites,
		});
	} catch (error) {
		console.log("Erro ao buscar convites do docente:", error);
		res.sendStatus(500);
	}
};

module.exports = {
	retornaTodosConvites,
	criaConvite,
	respondeConvite,
	deletaConvite,
	retornaConvitesDocente,
};
