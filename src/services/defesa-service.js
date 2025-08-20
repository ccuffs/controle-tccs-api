const defesaRepository = require("../repository/defesa-repository");

// Função auxiliar para calcular o horário anterior
const calcularHorarioAnterior = (hora) => {
	const [horas, minutos, segundos] = hora.split(":").map(Number);
	let horaAnterior = horas;
	let minutoAnterior = minutos - 30;

	if (minutoAnterior < 0) {
		minutoAnterior = 30;
		horaAnterior -= 1;
	}

	// Se for antes das 13:30, retornar null (não há horário anterior)
	if (horaAnterior < 13 || (horaAnterior === 13 && minutoAnterior < 30)) {
		return null;
	}

	return `${horaAnterior.toString().padStart(2, "0")}:${minutoAnterior.toString().padStart(2, "0")}:00`;
};

// Função auxiliar para calcular o próximo horário
const calcularHorarioPosterior = (hora) => {
	const [horas, minutos, segundos] = hora.split(":").map(Number);
	let proximaHora = horas;
	let proximoMinuto = minutos + 30;

	if (proximoMinuto >= 60) {
		proximoMinuto = 0;
		proximaHora += 1;
	}

	// Se passar das 21:30, retornar null (não há próximo horário)
	if (proximaHora > 21 || (proximaHora === 21 && proximoMinuto > 30)) {
		return null;
	}

	return `${proximaHora.toString().padStart(2, "0")}:${proximoMinuto.toString().padStart(2, "0")}:00`;
};

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

// Função para buscar defesas específicas por ID do TCC
const retornaDefesasPorTcc = async (req, res) => {
	try {
		const { id_tcc } = req.params;

		const defesas = await defesaRepository.obterDefesasPorTcc(id_tcc);

		if (!defesas || defesas.length === 0) {
			return res
				.status(404)
				.json({ message: "Nenhuma defesa encontrada para este TCC" });
		}

		res.status(200).json({ defesas: defesas });
	} catch (error) {
		console.log("Erro ao buscar defesas:", error);
		res.sendStatus(500);
	}
};

// Função para criar uma nova defesa
const criaDefesa = async (req, res) => {
	const formData = req.body.formData;

	try {
		// Verificar se já existe defesa para este TCC com este membro da banca
		const defesaExiste = await defesaRepository.verificarDefesaExiste(
			formData.id_tcc,
			formData.membro_banca,
		);

		if (defesaExiste) {
			return res.status(400).json({
				message:
					"Já existe uma defesa agendada para este TCC com este membro da banca",
			});
		}

		// Verificar se foi fornecido um membro da banca
		if (!formData.membro_banca) {
			return res.status(400).json({
				message: "É necessário informar um membro da banca",
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
	const { id_tcc, membro_banca } = req.params;
	const formData = req.body.formData;

	try {
		const sucesso = await defesaRepository.atualizarDefesa(
			id_tcc,
			membro_banca,
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
	const model = require("../models");
	const t = await model.sequelize.transaction();

	try {
		const { id_tcc, membro_banca, fase } = req.params;

		// Buscar a defesa antes de deletar para obter os dados necessários
		const defesa = await model.Defesa.findOne({
			where: {
				id_tcc: id_tcc,
				membro_banca: membro_banca,
				fase: fase,
			},
			include: [
				{
					model: model.TrabalhoConclusao,
					attributes: ["ano", "semestre", "id_curso", "fase"],
				},
			],
		});

		if (!defesa) {
			await t.rollback();
			return res.status(404).json({ message: "Defesa não encontrada" });
		}

		// Deletar a defesa
		const sucesso = await defesaRepository.deletarDefesa(
			id_tcc,
			membro_banca,
			fase,
		);

		if (!sucesso) {
			await t.rollback();
			return res.status(404).json({ message: "Defesa não encontrada" });
		}

		// Se a defesa tinha data e hora, restaurar as disponibilidades
		if (defesa.data_defesa) {
			const data = defesa.data_defesa.toISOString().split("T")[0];
			const hora = defesa.data_defesa.toTimeString().split(" ")[0];
			const horaAnterior = calcularHorarioAnterior(hora);
			const horaPosterior = calcularHorarioPosterior(hora);

			// Restaurar disponibilidade do horário da defesa
			await model.DocenteDisponibilidadeBanca.create(
				{
					ano: defesa.TrabalhoConclusao.ano,
					semestre: defesa.TrabalhoConclusao.semestre,
					id_curso: defesa.TrabalhoConclusao.id_curso,
					fase: defesa.TrabalhoConclusao.fase,
					codigo_docente: membro_banca,
					data_defesa: data,
					hora_defesa: hora,
				},
				{ transaction: t },
			);

			// Restaurar disponibilidade do horário anterior se existir
			if (horaAnterior) {
				await model.DocenteDisponibilidadeBanca.create(
					{
						ano: defesa.TrabalhoConclusao.ano,
						semestre: defesa.TrabalhoConclusao.semestre,
						id_curso: defesa.TrabalhoConclusao.id_curso,
						fase: defesa.TrabalhoConclusao.fase,
						codigo_docente: membro_banca,
						data_defesa: data,
						hora_defesa: horaAnterior,
					},
					{ transaction: t },
				);
			}

			// Restaurar disponibilidade do próximo horário se existir
			if (horaPosterior) {
				await model.DocenteDisponibilidadeBanca.create(
					{
						ano: defesa.TrabalhoConclusao.ano,
						semestre: defesa.TrabalhoConclusao.semestre,
						id_curso: defesa.TrabalhoConclusao.id_curso,
						fase: defesa.TrabalhoConclusao.fase,
						codigo_docente: membro_banca,
						data_defesa: data,
						hora_defesa: horaPosterior,
					},
					{ transaction: t },
				);
			}
		}

		await t.commit();
		res.status(200).json({
			message: "Defesa deletada com sucesso",
			disponibilidadesRestauradas: defesa.data_defesa ? true : false,
		});
	} catch (error) {
		await t.rollback();
		console.error("Erro ao deletar defesa:", error);
		res.status(500).json({ message: "Erro ao deletar defesa" });
	}
};

// Função para gerenciar banca de defesa com convites em transação única
const gerenciarBancaDefesa = async (req, res) => {
	const model = require("../models");
	const t = await model.sequelize.transaction();

	try {
		const {
			id_tcc,
			fase,
			membros_novos,
			membros_existentes,
			convites_banca_existentes,
			orientador_codigo
		} = req.body;

		if (!id_tcc || !fase || !Array.isArray(membros_novos) || !Array.isArray(membros_existentes)) {
			await t.rollback();
			return res.status(400).json({ message: "Parâmetros inválidos" });
		}

		const dataAtual = new Date().toISOString();
		const mensagemPadrao = "Informado pelo professor do CCR";

		// 1. Remover membros que não estão mais selecionados (exceto orientador)
		for (const membroExistente of membros_existentes) {
			if (!membros_novos.includes(membroExistente)) {
				// Deletar defesa (apenas membros da banca, não orientador)
				await model.Defesa.destroy({
					where: {
						id_tcc: id_tcc,
						membro_banca: membroExistente,
						fase: fase,
						orientador: false, // Apenas membros da banca, não o orientador
					},
					transaction: t,
				});

				// Deletar convite se existir (apenas convites de banca)
				await model.Convite.destroy({
					where: {
						id_tcc: id_tcc,
						codigo_docente: membroExistente,
						fase: fase,
						orientacao: false,
					},
					transaction: t,
				});
			}
		}

		// 2. Adicionar novos membros
		for (const membroNovo of membros_novos) {
			if (!membros_existentes.includes(membroNovo)) {
				// Verificar se já existe convite para este membro
				const conviteExistente = convites_banca_existentes?.find(
					c => c.codigo_docente === membroNovo
				);

				// Criar convite se não existir ou se foi recusado
				if (!conviteExistente || conviteExistente.aceito === false) {
					const convitePayload = {
						id_tcc: id_tcc,
						codigo_docente: membroNovo,
						fase: parseInt(fase),
						data_envio: dataAtual,
						mensagem_envio: mensagemPadrao,
						data_feedback: dataAtual,
						aceito: true,
						mensagem_feedback: mensagemPadrao,
						orientacao: false,
					};

					await model.Convite.create(convitePayload, { transaction: t });
				}

				// Criar defesa para o membro da banca
				const defesaPayload = {
					id_tcc: id_tcc,
					membro_banca: membroNovo,
					fase: parseInt(fase),
					orientador: false,
				};

				await model.Defesa.create(defesaPayload, { transaction: t });
			}
		}

		// 2.1 Garantir que o orientador também está na defesa
		if (orientador_codigo && membros_novos.length > 0) {
			// Verificar se já existe defesa para o orientador
			const defesaOrientadorExistente = await model.Defesa.findOne({
				where: {
					id_tcc: id_tcc,
					membro_banca: orientador_codigo,
					fase: fase,
					orientador: true,
				},
				transaction: t,
			});

			if (!defesaOrientadorExistente) {
				// Criar defesa para o orientador
				const defesaOrientadorPayload = {
					id_tcc: id_tcc,
					membro_banca: orientador_codigo,
					fase: parseInt(fase),
					orientador: true,
				};

				await model.Defesa.create(defesaOrientadorPayload, { transaction: t });
			}
		}

		// 3. Gerenciar alterações (quando membro é trocado)
		const alteracoes = req.body.alteracoes || [];
		for (const alteracao of alteracoes) {
			const { membro_antigo, membro_novo } = alteracao;

			if (membro_antigo && membro_novo) {
				const conviteAntigo = convites_banca_existentes?.find(
					c => c.codigo_docente === membro_antigo
				);

				if (conviteAntigo && conviteAntigo.aceito === true) {
					// Deletar convite anterior
					await model.Convite.destroy({
						where: {
							id_tcc: id_tcc,
							codigo_docente: membro_antigo,
							fase: fase,
							orientacao: false,
						},
						transaction: t,
					});

					// Criar novo convite com mensagem de alteração
					const mensagemAlteracao = `Alteração de banca informada pelo professor do CCR de ${membro_antigo} para ${membro_novo}`;

					const convitePayload = {
						id_tcc: id_tcc,
						codigo_docente: membro_novo,
						fase: parseInt(fase),
						data_envio: dataAtual,
						mensagem_envio: mensagemAlteracao,
						data_feedback: dataAtual,
						aceito: true,
						mensagem_feedback: mensagemAlteracao,
						orientacao: false,
					};

					await model.Convite.create(convitePayload, { transaction: t });
				}
			}
		}

		await t.commit();
		res.status(200).json({
			message: "Banca de defesa gerenciada com sucesso",
			membros_adicionados: membros_novos.filter(m => !membros_existentes.includes(m)).length,
			membros_removidos: membros_existentes.filter(m => !membros_novos.includes(m)).length,
			orientador_incluido: orientador_codigo ? true : false,
		});

	} catch (error) {
		await t.rollback();
		console.error("Erro ao gerenciar banca de defesa:", error);
		res.status(500).json({
			message: "Erro interno do servidor",
			error: error.message,
		});
	}
};

module.exports = {
	retornaTodasDefesas,
	retornaDefesasPorTcc,
	criaDefesa,
	atualizaDefesa,
	registraAvaliacaoDefesa,
	deletaDefesa,
	gerenciarBancaDefesa,
};
