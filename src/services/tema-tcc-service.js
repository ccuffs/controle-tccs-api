const temaTccRepository = require("../repository/tema-tcc-repository");
const { obterAnoSemestreAtual } = require("./ano-semestre-service");

const retornaTodosTemasTcc = async (req, res) => {
	try {
		const temas = await temaTccRepository.obterTodosTemasTcc();
		return res.status(200).json(temas);
	} catch (error) {
		console.log("Erro ao buscar temas TCC:", error);
		return res.status(500).json({ error: "Erro interno do servidor" });
	}
};

const retornaTemasTccPorCurso = async (req, res) => {
	const { id_curso } = req.params;

	try {
		// Obter ano e semestre atual usando a lógica baseada em ano_semestre
		const { ano: anoAtual, semestre: semestreAtual } =
			await obterAnoSemestreAtual();

		// Primeiro, buscar os temas TCC com docente e área
		const temas = await temaTccRepository.obterTemasTccPorCurso(id_curso);

		// Buscar vagas separadamente para cada docente
		const temasComVagas = await Promise.all(
			temas.map(async (tema) => {
				const temaData = tema.toJSON();

				// Buscar vagas da oferta do docente
				const docenteOferta =
					await temaTccRepository.buscarOfertaDocente(
						anoAtual,
						semestreAtual,
						id_curso,
						temaData.Docente.codigo,
					);

				const vagasOferta = docenteOferta ? docenteOferta.vagas : 0;

				// Adicionar vagas da oferta ao objeto
				temaData.vagasOferta = vagasOferta;

				return temaData;
			}),
		);

		return res.status(200).json(temasComVagas);
	} catch (error) {
		console.log("Erro ao buscar temas TCC por curso:", error);
		return res.status(500).json({ error: "Erro interno do servidor" });
	}
};

const retornaTemasTccPorDocente = async (req, res) => {
	const { codigo } = req.params;

	try {
		const temas = await temaTccRepository.obterTemasTccPorDocente(codigo);
		return res.status(200).json(temas);
	} catch (error) {
		console.log("Erro ao buscar temas TCC por docente:", error);
		return res.status(500).json({ error: "Erro interno do servidor" });
	}
};

const criaTemaTcc = async (req, res) => {
	const formData = req.body;

	try {
		const savedTema = await temaTccRepository.criarTemaTcc(formData);
		return res.status(201).json(savedTema);
	} catch (error) {
		console.log("Erro ao criar tema TCC:", error);
		return res.status(500).json({ error: "Erro interno do servidor" });
	}
};

const atualizaTemaTcc = async (req, res) => {
	const formData = req.body;

	try {
		const sucesso = await temaTccRepository.atualizarTemaTcc(
			formData.id,
			formData,
		);

		if (sucesso) {
			return res.status(200).json({ message: "Atualizado com sucesso!" });
		} else {
			return res.status(404).json({ error: "Tema TCC não encontrado" });
		}
	} catch (error) {
		console.log("Erro ao atualizar tema TCC:", error);
		return res.status(500).json({ error: "Erro interno do servidor" });
	}
};

const atualizaVagasTemaTcc = async (req, res) => {
	const { id } = req.params;
	const { vagas } = req.body;

	try {
		const sucesso = await temaTccRepository.atualizarVagasTemaTcc(
			id,
			vagas,
		);

		if (sucesso) {
			return res
				.status(200)
				.json({ message: "Vagas atualizadas com sucesso!" });
		} else {
			return res.status(404).json({ error: "Tema TCC não encontrado" });
		}
	} catch (error) {
		console.log("Erro ao atualizar vagas do tema TCC:", error);
		return res.status(500).json({ error: "Erro interno do servidor" });
	}
};

const deletaTemaTcc = async (req, res) => {
	const { id } = req.params;

	try {
		const sucesso = await temaTccRepository.deletarTemaTcc(id);

		if (sucesso) {
			return res
				.status(200)
				.json({ message: "Tema TCC deletado com sucesso!" });
		} else {
			return res.status(404).json({ error: "Tema TCC não encontrado" });
		}
	} catch (error) {
		console.log("Erro ao deletar tema TCC:", error);
		return res.status(500).json({ error: "Erro interno do servidor" });
	}
};

const atualizaVagasOfertaDocente = async (req, res) => {
	try {
		const { codigo_docente, id_curso } = req.params;
		const { vagas } = req.body;

		// Obter ano e semestre atual usando a lógica baseada em ano_semestre
		const { ano: anoAtual, semestre: semestreAtual } =
			await obterAnoSemestreAtual();

		// Buscar ou criar a oferta do docente
		const docenteOferta =
			await temaTccRepository.criarOuAtualizarOfertaDocente(
				anoAtual,
				semestreAtual,
				id_curso,
				codigo_docente,
				vagas,
			);

		return res.status(200).json({
			message: "Vagas da oferta atualizadas com sucesso",
			docenteOferta: docenteOferta,
		});
	} catch (error) {
		console.log("Erro ao atualizar vagas da oferta do docente:", error);
		return res.status(500).json({ error: "Erro interno do servidor" });
	}
};

module.exports = {
	retornaTodosTemasTcc,
	retornaTemasTccPorCurso,
	retornaTemasTccPorDocente,
	criaTemaTcc,
	atualizaTemaTcc,
	atualizaVagasTemaTcc,
	deletaTemaTcc,
	atualizaVagasOfertaDocente,
};
