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

// Função auxiliar para calcular ambos os horários
const calcularHorarios = (hora) => {
	return {
		horaAnterior: calcularHorarioAnterior(hora),
		horaPosterior: calcularHorarioPosterior(hora)
	};
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
		res.status(500).json({ message: "Erro ao buscar defesas" });
	}
};

// Função para buscar defesas específicas por ID do TCC
const retornaDefesasPorTcc = async (req, res) => {
	try {
		const { id_tcc } = req.params;

		const defesas = await defesaRepository.obterDefesasPorTcc(id_tcc);

		// Retorna array vazio se não houver defesas ao invés de erro 404
		res.status(200).json({ defesas: defesas || [] });
	} catch (error) {
		console.log("Erro ao buscar defesas:", error);
		res.status(500).json({ message: "Erro ao buscar defesas" });
	}
};

// Função para criar uma nova defesa
const criaDefesa = async (req, res) => {
	const formData = req.body.formData;

	try {
		// Verificar se foi fornecido um membro da banca
		if (!formData.membro_banca) {
			return res.status(400).json({
				message: "É necessário informar um membro da banca",
			});
		}

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

		const defesa = await defesaRepository.criarDefesa(formData);

		res.status(201).json({
			message: "Defesa criada com sucesso",
		});
	} catch (error) {
		console.log("Erro ao criar defesa:", error);
		console.log("Dados que causaram erro:", formData);
		res.status(500).json({ message: "Erro ao criar defesa" });
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
		res.status(500).json({ message: "Erro ao atualizar defesa" });
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
		res.status(500).json({ message: "Erro ao registrar avaliação" });
	}
};

// Função para deletar uma defesa
const deletaDefesa = async (req, res) => {
	try {
		const { id_tcc, membro_banca, fase } = req.params;

		const resultado = await defesaRepository.deletarDefesaComRestauracao(
			id_tcc,
			membro_banca,
			fase,
			calcularHorarios
		);

		if (resultado.sucesso) {
			res.status(200).json({
				message: "Defesa deletada com sucesso",
				disponibilidadesRestauradas: resultado.disponibilidadesRestauradas,
			});
		} else {
			res.status(404).json({ message: resultado.motivo });
		}
	} catch (error) {
		console.error("Erro ao deletar defesa:", error);
		res.status(500).json({ message: "Erro ao deletar defesa" });
	}
};

// Função para gerenciar banca de defesa com convites em transação única
const gerenciarBancaDefesa = async (req, res) => {
	try {
		const {
			id_tcc,
			fase,
			membros_novos,
			membros_existentes,
			convites_banca_existentes,
			orientador_codigo,
			data_hora_defesa,
			alteracoes
		} = req.body;

		if (!id_tcc || !fase || !Array.isArray(membros_novos) || !Array.isArray(membros_existentes)) {
			return res.status(400).json({ message: "Parâmetros inválidos" });
		}

		const resultado = await defesaRepository.gerenciarBancaDefesa({
			id_tcc,
			fase,
			membros_novos,
			membros_existentes,
			convites_banca_existentes,
			orientador_codigo,
			data_hora_defesa,
			alteracoes
		});

		if (resultado.sucesso) {
			res.status(200).json({
				message: "Banca de defesa gerenciada com sucesso",
				membros_adicionados: resultado.membros_adicionados,
				membros_removidos: resultado.membros_removidos,
				orientador_incluido: resultado.orientador_incluido,
				data_defesa_atualizada: resultado.data_defesa_atualizada,
			});
		} else {
			res.status(400).json({ message: "Erro ao gerenciar banca de defesa" });
		}

	} catch (error) {
		console.error("Erro ao gerenciar banca de defesa:", error);
		res.status(500).json({
			message: "Erro interno do servidor",
		});
	}
};

// Função para agendar uma defesa
const agendarDefesa = async (req, res) => {
	try {
		const {
			id_tcc,
			fase,
			data,
			hora,
			codigo_orientador,
			membros_banca,
		} = req.body;

		if (
			!id_tcc ||
			!fase ||
			!data ||
			!hora ||
			!codigo_orientador ||
			!Array.isArray(membros_banca) ||
			membros_banca.length !== 2
		) {
			return res
				.status(400)
				.json({ message: "Parâmetros inválidos" });
		}

		const resultado = await defesaRepository.agendarDefesa({
			id_tcc,
			fase,
			data,
			hora,
			codigo_orientador,
			membros_banca,
		}, calcularHorarios);

		if (resultado.sucesso) {
			return res.status(201).json({
				message: "Defesa agendada com sucesso",
				horarioAnteriorRemovido: resultado.horarioAnteriorRemovido,
				horarioPosteriorRemovido: resultado.horarioPosteriorRemovido,
			});
		} else {
			return res.status(400).json({ message: "Erro ao agendar defesa" });
		}
	} catch (error) {
		console.error("Erro ao agendar defesa:", error);
		return res.status(500).json({
			message: "Erro ao agendar defesa",
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
	agendarDefesa,
};
