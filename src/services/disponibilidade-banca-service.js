const disponibilidadeBancaRepository = require("../repository/disponibilidade-banca-repository");
const datasDefesaRepository = require("../repository/datas-defesa-repository");

// Função utilitária para adicionar compatibilidade do campo 'disponivel'
const adicionarFlagDisponivel = (entrada) => {
	if (!entrada) return entrada;
	if (Array.isArray(entrada)) {
		return entrada.map((item) => ({
			...(item.toJSON?.() ?? item),
			disponivel: true,
		}));
	}
	return { ...(entrada.toJSON?.() ?? entrada), disponivel: true };
};

// Função para retornar todas as disponibilidades de banca
const retornaTodasDisponibilidades = async (req, res) => {
	try {
		const { ano, semestre, id_curso, fase, codigo_docente, data_defesa } =
			req.query;
		const filtros = {
			ano,
			semestre,
			id_curso,
			fase,
			codigo_docente,
			data_defesa,
		};

		const disponibilidades =
			await disponibilidadeBancaRepository.obterTodasDisponibilidades(
				filtros,
			);
		res.status(200).json({
			disponibilidades: adicionarFlagDisponivel(disponibilidades),
		});
	} catch (error) {
		console.log("Erro ao buscar disponibilidades:", error);
		res.sendStatus(500);
	}
};

// Função para buscar disponibilidade específica
const retornaDisponibilidade = async (req, res) => {
	try {
		const {
			ano,
			semestre,
			id_curso,
			fase,
			codigo_docente,
			data_defesa,
			hora_defesa,
		} = req.params;

		const disponibilidade =
			await disponibilidadeBancaRepository.obterDisponibilidade(
				ano,
				semestre,
				id_curso,
				fase,
				codigo_docente,
				data_defesa,
				hora_defesa,
			);

		if (!disponibilidade) {
			return res
				.status(404)
				.json({ message: "Disponibilidade não encontrada" });
		}

		res.status(200).json({
			disponibilidade: adicionarFlagDisponivel(disponibilidade),
		});
	} catch (error) {
		console.log("Erro ao buscar disponibilidade:", error);
		res.sendStatus(500);
	}
};

// Função para buscar disponibilidades por docente e oferta
const retornaDisponibilidadesPorDocenteEOferta = async (req, res) => {
	try {
		const { codigo_docente, ano, semestre, id_curso, fase } = req.params;

		const disponibilidades =
			await disponibilidadeBancaRepository.obterDisponibilidadesPorDocenteEOferta(
				codigo_docente,
				ano,
				semestre,
				id_curso,
				fase,
			);

		res.status(200).json({
			disponibilidades: adicionarFlagDisponivel(disponibilidades),
		});
	} catch (error) {
		console.log("Erro ao buscar disponibilidades:", error);
		res.sendStatus(500);
	}
};

// Função para criar nova disponibilidade
const criaDisponibilidade = async (req, res) => {
	try {
		const dadosDisponibilidade = { ...req.body };
		delete dadosDisponibilidade.disponivel;

		// Validações básicas
		if (
			!dadosDisponibilidade.ano ||
			!dadosDisponibilidade.semestre ||
			!dadosDisponibilidade.id_curso ||
			!dadosDisponibilidade.fase ||
			!dadosDisponibilidade.codigo_docente ||
			!dadosDisponibilidade.data_defesa ||
			!dadosDisponibilidade.hora_defesa
		) {
			return res.status(400).json({
				message: "Todos os campos são obrigatórios",
			});
		}

		const novaDisponibilidade =
			await disponibilidadeBancaRepository.criarDisponibilidade(
				dadosDisponibilidade,
			);
		res.status(201).json({
			disponibilidade: adicionarFlagDisponivel(novaDisponibilidade),
		});
	} catch (error) {
		console.log("Erro ao criar disponibilidade:", error);
		res.status(500).json({ message: "Erro ao criar disponibilidade" });
	}
};

// Função para atualizar disponibilidade
const atualizaDisponibilidade = async (req, res) => {
	try {
		const {
			ano,
			semestre,
			id_curso,
			fase,
			codigo_docente,
			data_defesa,
			hora_defesa,
		} = req.params;
		const dadosDisponibilidade = { ...req.body };
		delete dadosDisponibilidade.disponivel;

		const atualizada =
			await disponibilidadeBancaRepository.atualizarDisponibilidade(
				ano,
				semestre,
				id_curso,
				fase,
				codigo_docente,
				data_defesa,
				hora_defesa,
				dadosDisponibilidade,
			);

		if (atualizada) {
			res.status(200).json({
				message: "Disponibilidade atualizada com sucesso",
			});
		} else {
			res.status(404).json({ message: "Disponibilidade não encontrada" });
		}
	} catch (error) {
		console.log("Erro ao atualizar disponibilidade:", error);
		res.status(500).json({ message: "Erro ao atualizar disponibilidade" });
	}
};

// Função para criar ou atualizar disponibilidade (upsert)
const criaOuAtualizaDisponibilidade = async (req, res) => {
	try {
		const dadosDisponibilidade = { ...req.body };
		delete dadosDisponibilidade.disponivel;

		// Validações básicas
		if (
			!dadosDisponibilidade.ano ||
			!dadosDisponibilidade.semestre ||
			!dadosDisponibilidade.id_curso ||
			!dadosDisponibilidade.fase ||
			!dadosDisponibilidade.codigo_docente ||
			!dadosDisponibilidade.data_defesa ||
			!dadosDisponibilidade.hora_defesa
		) {
			return res.status(400).json({
				message: "Todos os campos são obrigatórios",
			});
		}

		const disponibilidade =
			await disponibilidadeBancaRepository.criarOuAtualizarDisponibilidade(
				dadosDisponibilidade,
			);
		res.status(200).json({
			disponibilidade: adicionarFlagDisponivel(disponibilidade),
		});
	} catch (error) {
		console.log("Erro ao criar/atualizar disponibilidade:", error);
		res.status(500).json({
			message: "Erro ao criar/atualizar disponibilidade",
		});
	}
};

// Função para deletar disponibilidade
const deletaDisponibilidade = async (req, res) => {
	try {
		const {
			ano,
			semestre,
			id_curso,
			fase,
			codigo_docente,
			data_defesa,
			hora_defesa,
		} = req.params;

		const deleted =
			await disponibilidadeBancaRepository.deletarDisponibilidade(
				ano,
				semestre,
				id_curso,
				fase,
				codigo_docente,
				data_defesa,
				hora_defesa,
			);

		if (deleted) {
			res.status(200).json({
				message: "Disponibilidade deletada com sucesso",
			});
		} else {
			res.status(404).json({ message: "Disponibilidade não encontrada" });
		}
	} catch (error) {
		console.log("Erro ao deletar disponibilidade:", error);
		res.status(500).json({ message: "Erro ao deletar disponibilidade" });
	}
};

// Função para obter grade de disponibilidade para um docente e oferta
const retornaGradeDisponibilidade = async (req, res) => {
	try {
		const { codigo_docente, ano, semestre, id_curso, fase } = req.params;

		// Buscar datas de defesa para a oferta
		const datasDefesa =
			await datasDefesaRepository.obterDatasDefesaPorOferta(
				ano,
				semestre,
				id_curso,
				fase,
			);

		if (!datasDefesa) {
			return res.status(404).json({
				message: "Datas de defesa não encontradas para esta oferta",
			});
		}

		// Buscar disponibilidades existentes do docente
		const disponibilidades =
			await disponibilidadeBancaRepository.obterDisponibilidadesPorDocenteEOferta(
				codigo_docente,
				ano,
				semestre,
				id_curso,
				fase,
			);

		// Gerar horários (13:30 até 21:30 em intervalos de 30 minutos)
		const horarios = [];
		const horaInicio = 13;
		const minutoInicio = 30;
		const horaFim = 21;
		const minutoFim = 30;

		for (let hora = horaInicio; hora <= horaFim; hora++) {
			for (let minuto = 0; minuto < 60; minuto += 30) {
				if (hora === horaInicio && minuto < minutoInicio) continue;
				if (hora === horaFim && minuto > minutoFim) continue;

				const horaStr = hora.toString().padStart(2, "0");
				const minutoStr = minuto.toString().padStart(2, "0");
				horarios.push(`${horaStr}:${minutoStr}:00`);
			}
		}

		// Gerar datas entre inicio e fim
		const datas = [];
		if (datasDefesa.inicio && datasDefesa.fim) {
			const dataInicio = new Date(datasDefesa.inicio);
			const dataFim = new Date(datasDefesa.fim);

			for (
				let data = new Date(dataInicio);
				data <= dataFim;
				data.setDate(data.getDate() + 1)
			) {
				datas.push(new Date(data).toISOString().split("T")[0]);
			}
		}

		// Criar grade de disponibilidade
		const grade = {
			horarios: horarios,
			datas: datas,
			disponibilidades: adicionarFlagDisponivel(disponibilidades),
			datasDefesa: datasDefesa,
		};

		res.status(200).json({ grade: grade });
	} catch (error) {
		console.log("Erro ao buscar grade de disponibilidade:", error);
		res.sendStatus(500);
	}
};

// Função para sincronizar múltiplas disponibilidades
const sincronizarDisponibilidades = async (req, res) => {
	try {
		const { disponibilidades } = req.body;

		if (!disponibilidades || !Array.isArray(disponibilidades)) {
			return res.status(400).json({
				message: "Lista de disponibilidades é obrigatória",
			});
		}

		const resultados = [];

		for (const dadosDisponibilidade of disponibilidades) {
			// Validações básicas para cada disponibilidade
			if (
				!dadosDisponibilidade.ano ||
				!dadosDisponibilidade.semestre ||
				!dadosDisponibilidade.id_curso ||
				!dadosDisponibilidade.fase ||
				!dadosDisponibilidade.codigo_docente ||
				!dadosDisponibilidade.data_defesa ||
				!dadosDisponibilidade.hora_defesa
			) {
				return res.status(400).json({
					message:
						"Todos os campos são obrigatórios para cada disponibilidade",
				});
			}

			try {
				if (dadosDisponibilidade.disponivel === true) {
					const payload = { ...dadosDisponibilidade };
					delete payload.disponivel;
					const disponibilidade =
						await disponibilidadeBancaRepository.criarOuAtualizarDisponibilidade(
							payload,
						);
					resultados.push({
						success: true,
						data: dadosDisponibilidade.data_defesa,
						hora: dadosDisponibilidade.hora_defesa,
						disponibilidade:
							adicionarFlagDisponivel(disponibilidade),
					});
				} else if (dadosDisponibilidade.disponivel === false) {
					const deleted =
						await disponibilidadeBancaRepository.deletarDisponibilidade(
							dadosDisponibilidade.ano,
							dadosDisponibilidade.semestre,
							dadosDisponibilidade.id_curso,
							dadosDisponibilidade.fase,
							dadosDisponibilidade.codigo_docente,
							dadosDisponibilidade.data_defesa,
							dadosDisponibilidade.hora_defesa,
						);
					resultados.push({
						success: true,
						data: dadosDisponibilidade.data_defesa,
						hora: dadosDisponibilidade.hora_defesa,
						deleted,
					});
				} else {
					// Caso o campo não venha definido, não persiste nem remove.
					// Isso garante que apenas registros explicitamente marcados como disponíveis sejam salvos.
					resultados.push({
						success: true,
						data: dadosDisponibilidade.data_defesa,
						hora: dadosDisponibilidade.hora_defesa,
						ignored: true,
					});
				}
			} catch (error) {
				resultados.push({
					success: false,
					data: dadosDisponibilidade.data_defesa,
					hora: dadosDisponibilidade.hora_defesa,
					error: error.message,
				});
			}
		}

		const sucessos = resultados.filter((r) => r.success).length;
		const falhas = resultados.filter((r) => !r.success).length;

		res.status(200).json({
			message: `Sincronização concluída: ${sucessos} sucessos, ${falhas} falhas`,
			resultados: resultados,
		});
	} catch (error) {
		console.log("Erro ao sincronizar disponibilidades:", error);
		res.status(500).json({
			message: "Erro ao sincronizar disponibilidades",
		});
	}
};

module.exports = {
	retornaTodasDisponibilidades,
	retornaDisponibilidade,
	retornaDisponibilidadesPorDocenteEOferta,
	criaDisponibilidade,
	atualizaDisponibilidade,
	criaOuAtualizaDisponibilidade,
	deletaDisponibilidade,
	retornaGradeDisponibilidade,
	sincronizarDisponibilidades,
};
