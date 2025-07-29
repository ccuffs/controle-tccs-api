const usuarioRepository = require("../repository/usuario-repository");

// GET /api/usuarios - Buscar todos os usuários
const retornaTodosUsuarios = async (req, res) => {
	try {
		const usuarios = await usuarioRepository.obterTodosUsuarios();
		res.status(200).json({ usuarios: usuarios });
	} catch (error) {
		console.log("Erro ao buscar usuários:", error);
		res.sendStatus(500);
	}
};

// GET /api/usuarios/:userId/cursos - Buscar cursos vinculados ao usuário
const retornaCursosDoUsuario = async (req, res) => {
	try {
		const { userId } = req.params;

		const usuario = await usuarioRepository.obterUsuarioComCursos(userId);

		if (!usuario) {
			return res.status(404).json({ message: "Usuário não encontrado" });
		}

		res.status(200).json({ cursos: usuario.cursos });
	} catch (error) {
		console.log("Erro ao buscar cursos do usuário:", error);
		res.status(500).json({ message: "Erro interno do servidor" });
	}
};

// GET /api/usuarios/:userId - Buscar usuário específico
const retornaUsuarioPorId = async (req, res) => {
	try {
		const { userId } = req.params;
		const usuario = await usuarioRepository.obterUsuarioPorId(userId);

		if (!usuario) {
			return res.status(404).json({ message: "Usuário não encontrado" });
		}

		res.status(200).json({ usuario: usuario });
	} catch (error) {
		console.log("Erro ao buscar usuário:", error);
		res.sendStatus(500);
	}
};

// POST /api/usuarios - Criar novo usuário
const criaUsuario = async (req, res) => {
	const formData = req.body.formData;
	try {
		const usuario = await usuarioRepository.criarUsuario(formData);
		res.sendStatus(200);
	} catch (error) {
		console.log("Erro ao criar usuário:", error);
		res.sendStatus(500);
	}
};

// PUT /api/usuarios - Atualizar usuário
const atualizaUsuario = async (req, res) => {
	const formData = req.body.formData;
	try {
		const sucesso = await usuarioRepository.atualizarUsuario(
			formData.id,
			formData,
		);

		if (sucesso) {
			res.sendStatus(200);
		} else {
			res.status(404).send({ message: "Usuário não encontrado" });
		}
	} catch (error) {
		console.log("Erro ao atualizar usuário:", error);
		res.sendStatus(500);
	}
};

// DELETE /api/usuarios/:id - Deletar usuário
const deletaUsuario = async (req, res) => {
	try {
		const id = req.params.id;
		const sucesso = await usuarioRepository.deletarUsuario(id);

		if (sucesso) {
			res.sendStatus(200);
		} else {
			res.status(404).send({ message: "Usuário não encontrado" });
		}
	} catch (error) {
		console.error("Erro ao deletar usuário:", error);
		res.status(500).send({ message: "Erro ao deletar usuário" });
	}
};

module.exports = {
	retornaTodosUsuarios,
	retornaCursosDoUsuario,
	retornaUsuarioPorId,
	criaUsuario,
	atualizaUsuario,
	deletaUsuario,
};
