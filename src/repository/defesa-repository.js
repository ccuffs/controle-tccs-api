const model = require("../models");
const defesaRepository = {};

// Buscar todas as defesas com filtros
defesaRepository.obterTodasDefesas = async (filtros) => {
	const { id_tcc, ano, semestre } = filtros;

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
				as: "membroBanca",
				attributes: ["codigo", "nome", "email", "siape"],
			},
		],
		order: [["data_defesa", "DESC"]],
	});

	return defesas;
};

// Buscar defesas por TCC (todas as defesas do TCC)
defesaRepository.obterDefesasPorTcc = async (idTcc) => {
	const defesas = await model.Defesa.findAll({
		where: { id_tcc: idTcc },
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
				as: "membroBanca",
				attributes: ["codigo", "nome", "email", "siape"],
			},
		],
		order: [["membro_banca", "ASC"]],
	});
	return defesas;
};

// Verificar se defesa existe para um TCC e membro específico
defesaRepository.verificarDefesaExiste = async (idTcc, membroBanca = null) => {
	let whereClause = { id_tcc: idTcc };

	// Se informado membro específico, verificar para esse membro
	if (membroBanca) {
		whereClause.membro_banca = membroBanca;
	}

	const defesa = await model.Defesa.findOne({
		where: whereClause,
	});
	return defesa !== null;
};

// Criar nova defesa
defesaRepository.criarDefesa = async (dadosDefesa) => {
	const defesa = model.Defesa.build(dadosDefesa);
	await defesa.save();
	return defesa;
};

// Atualizar defesa
defesaRepository.atualizarDefesa = async (
	idTcc,
	membroBanca,
	dadosDefesa,
	fase = null,
) => {
	const whereClause = {
		id_tcc: idTcc,
		membro_banca: membroBanca,
	};

	// Adicionar fase apenas se fornecida
	if (fase !== undefined && fase !== null) {
		whereClause.fase = fase;
	}

	const [linhasAfetadas] = await model.Defesa.update(dadosDefesa, {
		where: whereClause,
	});
	return linhasAfetadas > 0;
};

// Registrar avaliação da defesa
defesaRepository.registrarAvaliacaoDefesa = async (idTcc, avaliacao) => {
	const [linhasAfetadas] = await model.Defesa.update(
		{ avaliacao: avaliacao },
		{ where: { id_tcc: idTcc } },
	);
	return linhasAfetadas > 0;
};

// Deletar defesa
defesaRepository.deletarDefesa = async (idTcc, membroBanca, fase) => {
	const whereClause = {
		id_tcc: idTcc,
		membro_banca: membroBanca,
	};

	// Adicionar fase apenas se fornecida
	if (fase !== undefined && fase !== null) {
		whereClause.fase = fase;
	}

	const deleted = await model.Defesa.destroy({
		where: whereClause,
	});
	return deleted > 0;
};

// Deletar defesa com restauração de disponibilidades (transação)
defesaRepository.deletarDefesaComRestauracao = async (
	idTcc,
	membroBanca,
	fase,
	calcularHorarios,
) => {
	const t = await model.sequelize.transaction();

	try {
		// Buscar a defesa antes de deletar para obter os dados necessários
		const defesa = await model.Defesa.findOne({
			where: {
				id_tcc: idTcc,
				membro_banca: membroBanca,
				fase: fase,
			},
			include: [
				{
					model: model.TrabalhoConclusao,
					attributes: ["ano", "semestre", "id_curso", "fase"],
				},
			],
			transaction: t,
		});

		if (!defesa) {
			await t.rollback();
			return { sucesso: false, motivo: "Defesa não encontrada" };
		}

		// Deletar a defesa
		const sucesso = await model.Defesa.destroy({
			where: {
				id_tcc: idTcc,
				membro_banca: membroBanca,
				fase: fase,
			},
			transaction: t,
		});

		if (!sucesso) {
			await t.rollback();
			return { sucesso: false, motivo: "Defesa não encontrada" };
		}

		// Se a defesa tinha data e hora, restaurar as disponibilidades
		if (defesa.data_defesa) {
			const data = defesa.data_defesa.toISOString().split("T")[0];
			const hora = defesa.data_defesa.toTimeString().split(" ")[0];
			const { horaAnterior, horaPosterior } = calcularHorarios(hora);

			// Restaurar disponibilidade do horário da defesa
			await model.DocenteDisponibilidadeBanca.create(
				{
					ano: defesa.TrabalhoConclusao.ano,
					semestre: defesa.TrabalhoConclusao.semestre,
					id_curso: defesa.TrabalhoConclusao.id_curso,
					fase: defesa.TrabalhoConclusao.fase,
					codigo_docente: membroBanca,
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
						codigo_docente: membroBanca,
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
						codigo_docente: membroBanca,
						data_defesa: data,
						hora_defesa: horaPosterior,
					},
					{ transaction: t },
				);
			}
		}

		await t.commit();
		return {
			sucesso: true,
			disponibilidadesRestauradas: defesa.data_defesa ? true : false,
		};
	} catch (error) {
		await t.rollback();
		throw error;
	}
};

// Agendar defesa com remoção de disponibilidades (transação)
defesaRepository.agendarDefesa = async (dadosAgendamento, calcularHorarios) => {
	const t = await model.sequelize.transaction();

	try {
		const { id_tcc, fase, data, hora, codigo_orientador, membros_banca } =
			dadosAgendamento;

		// Criar/validar registros de defesa: orientador + 2 membros
		const docentes = [
			{ codigo: codigo_orientador, orientador: true },
			{ codigo: membros_banca[0], orientador: false },
			{ codigo: membros_banca[1], orientador: false },
		];

		// Criar data completa (DATE em modelo de defesa)
		const dataHora = new Date(`${data}T${hora}`);

		// Inserir defesas
		for (const d of docentes) {
			await model.Defesa.create(
				{
					id_tcc,
					membro_banca: d.codigo,
					fase,
					data_defesa: dataHora,
					orientador: d.orientador,
				},
				{ transaction: t },
			);
		}

		// Buscar dados do TCC para remover disponibilidades
		const tcc = await model.TrabalhoConclusao.findOne({
			where: { id: id_tcc },
			transaction: t,
		});

		if (!tcc) {
			throw new Error("TCC não encontrado");
		}

		// Calcular horários anterior e posterior
		const { horaAnterior, horaPosterior } = calcularHorarios(hora);

		const removerParaDocente = async (codigo) => {
			// Remover disponibilidade do horário escolhido
			await model.DocenteDisponibilidadeBanca.destroy({
				where: {
					ano: tcc.ano,
					semestre: tcc.semestre,
					id_curso: tcc.id_curso,
					fase: tcc.fase,
					codigo_docente: codigo,
					data_defesa: data,
					hora_defesa: hora,
				},
				transaction: t,
			});

			// Remover disponibilidade do horário anterior se existir
			if (horaAnterior) {
				await model.DocenteDisponibilidadeBanca.destroy({
					where: {
						ano: tcc.ano,
						semestre: tcc.semestre,
						id_curso: tcc.id_curso,
						fase: tcc.fase,
						codigo_docente: codigo,
						data_defesa: data,
						hora_defesa: horaAnterior,
					},
					transaction: t,
				});
			}

			// Remover disponibilidade do próximo horário se existir
			if (horaPosterior) {
				await model.DocenteDisponibilidadeBanca.destroy({
					where: {
						ano: tcc.ano,
						semestre: tcc.semestre,
						id_curso: tcc.id_curso,
						fase: tcc.fase,
						codigo_docente: codigo,
						data_defesa: data,
						hora_defesa: horaPosterior,
					},
					transaction: t,
				});
			}
		};

		await removerParaDocente(codigo_orientador);
		await removerParaDocente(membros_banca[0]);
		await removerParaDocente(membros_banca[1]);

		await t.commit();
		return {
			sucesso: true,
			horarioAnteriorRemovido: horaAnterior ? true : false,
			horarioPosteriorRemovido: horaPosterior ? true : false,
		};
	} catch (error) {
		await t.rollback();
		throw error;
	}
};

// Gerenciar banca de defesa (transação)
defesaRepository.gerenciarBancaDefesa = async (dadosBanca) => {
	const t = await model.sequelize.transaction();

	try {
		const {
			id_tcc,
			fase,
			membros_novos,
			membros_existentes,
			convites_banca_existentes,
			orientador_codigo,
			data_hora_defesa,
			alteracoes = [],
		} = dadosBanca;

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
						orientador: false,
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
					(c) => c.codigo_docente === membroNovo,
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

					await model.Convite.create(convitePayload, {
						transaction: t,
					});
				}

				// Criar defesa para o membro da banca
				const defesaPayload = {
					id_tcc: id_tcc,
					membro_banca: membroNovo,
					fase: parseInt(fase),
					orientador: false,
					data_defesa: data_hora_defesa
						? new Date(data_hora_defesa)
						: null,
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
					data_defesa: data_hora_defesa
						? new Date(data_hora_defesa)
						: null,
				};

				await model.Defesa.create(defesaOrientadorPayload, {
					transaction: t,
				});
			}
		}

		// 3. Gerenciar alterações (quando membro é trocado)
		for (const alteracao of alteracoes) {
			const { membro_antigo, membro_novo } = alteracao;

			if (membro_antigo && membro_novo) {
				const conviteAntigo = convites_banca_existentes?.find(
					(c) => c.codigo_docente === membro_antigo,
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

					await model.Convite.create(convitePayload, {
						transaction: t,
					});
				}
			}
		}

		// 4. Atualizar data da defesa em todas as defesas do TCC nesta fase
		if (data_hora_defesa !== undefined) {
			// Converter data_hora_defesa para formato adequado do banco
			let dataDefesa = null;
			if (data_hora_defesa) {
				dataDefesa = new Date(data_hora_defesa);
			}

			// Atualizar todas as defesas existentes deste TCC e fase com a nova data
			await model.Defesa.update(
				{ data_defesa: dataDefesa },
				{
					where: {
						id_tcc: id_tcc,
						fase: fase,
					},
					transaction: t,
				},
			);

			// 4.1. Se data de defesa foi definida, verificar se deve atualizar etapa do TCC
			if (dataDefesa && membros_novos.length >= 2) {
				// Buscar o TCC atual para verificar a etapa
				const tccAtual = await model.TrabalhoConclusao.findOne({
					where: { id: id_tcc },
					transaction: t,
				});

				// Se o TCC está na etapa 5, atualizar para etapa 6
				if (tccAtual && tccAtual.etapa === 5) {
					await model.TrabalhoConclusao.update(
						{ etapa: 6 },
						{
							where: { id: id_tcc },
							transaction: t,
						},
					);
				}
			}
		}

		await t.commit();
		return {
			sucesso: true,
			membros_adicionados: membros_novos.filter(
				(m) => !membros_existentes.includes(m),
			).length,
			membros_removidos: membros_existentes.filter(
				(m) => !membros_novos.includes(m),
			).length,
			orientador_incluido: orientador_codigo ? true : false,
			data_defesa_atualizada:
				data_hora_defesa !== undefined ? true : false,
		};
	} catch (error) {
		await t.rollback();
		throw error;
	}
};

module.exports = defesaRepository;
