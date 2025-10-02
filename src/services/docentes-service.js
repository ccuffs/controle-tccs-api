const docenteRepository = require("../repository/docente-repository");

// Função para retornar todos os docentes
const retornaTodosDocentes = async (req, res) => {
	try {
		const docentes = await docenteRepository.obterTodosDocentes();
		res.status(200).json({ docentes: docentes });
	} catch (error) {
		console.log("Erro ao buscar docentes:", error);
		res.sendStatus(500);
	}
};

// Função para criar um novo docente
const criaDocente = async (req, res) => {
	const formData = req.body.formData;
	try {
		const docente = await docenteRepository.criarDocente(formData);
		res.sendStatus(200);
	} catch (error) {
		console.log("Erro ao criar docente:", error);
		res.sendStatus(500);
	}
};

// Função para atualizar um docente
const atualizaDocente = async (req, res) => {
	const formData = req.body.formData;
	const id_usuario = req.usuario.id;
	const permissoesService = require("./permissoes-service");

	try {
		// Verificar se o usuário está editando seus próprios dados
		const docenteUsuario =
			await docenteRepository.obterDocentePorUsuario(id_usuario);

		if (docenteUsuario && docenteUsuario.codigo === formData.codigo) {
			// Docente editando seus próprios dados - permitir apenas sala e siape
			const dadosPermitidos = {
				siape: formData.siape,
				sala: formData.sala,
			};

			const sucesso = await docenteRepository.atualizarDocente(
				formData.codigo,
				dadosPermitidos,
			);

			if (sucesso) {
				return res.sendStatus(200);
			} else {
				return res
					.status(404)
					.send({ message: "Docente não encontrado" });
			}
		}

		// Caso contrário, verificar se tem permissão administrativa
		const permissoesUsuario =
			await permissoesService.buscarPermissoesDoUsuario(id_usuario);
		const { Permissoes } = require("../enums/permissoes");

		const temPermissao = permissoesUsuario.some(
			(permissao) => permissao.id === Permissoes.DOCENTE.EDITAR,
		);

		if (!temPermissao) {
			return res.status(403).json({
				message:
					"Permissão negada: você só pode editar seus próprios dados",
			});
		}

		// Atualização administrativa completa
		const sucesso = await docenteRepository.atualizarDocente(
			formData.codigo,
			formData,
		);

		if (sucesso) {
			res.sendStatus(200);
		} else {
			res.status(404).send({ message: "Docente não encontrado" });
		}
	} catch (error) {
		console.log("Erro ao atualizar docente:", error);
		res.sendStatus(500);
	}
};

// Função para deletar um docente
const deletaDocente = async (req, res) => {
	try {
		const codigo = req.params.codigo;
		const sucesso = await docenteRepository.deletarDocente(codigo);

		if (sucesso) {
			res.sendStatus(200);
		} else {
			res.status(404).send({ message: "Docente não encontrado" });
		}
	} catch (error) {
		console.error("Erro ao deletar docente:", error);
		res.status(500).send({ message: "Erro ao deletar docente" });
	}
};

// Função para retornar dados do docente pelo usuário logado
const retornaDocentePorUsuario = async (req, res) => {
	try {
		const id_usuario = req.usuario.id;
		const docente =
			await docenteRepository.obterDocentePorUsuario(id_usuario);

		if (!docente) {
			return res.status(404).json({ message: "Docente não encontrado" });
		}

		res.status(200).json({ docente: docente });
	} catch (error) {
		console.log("Erro ao buscar docente por usuário:", error);
		res.sendStatus(500);
	}
};

module.exports = {
	retornaTodosDocentes,
	criaDocente,
	atualizaDocente,
	deletaDocente,
	retornaDocentePorUsuario,
};
