const model = require("@backend/models");
const usuarioRepository = {};

// Buscar todos os usuários
usuarioRepository.obterTodosUsuarios = async () => {
	const usuarios = await model.Usuario.findAll();
	return usuarios;
};

// Buscar usuário por ID
usuarioRepository.obterUsuarioPorId = async (userId) => {
	const usuario = await model.Usuario.findByPk(userId);
	return usuario;
};

// Buscar usuário por ID com cursos
usuarioRepository.obterUsuarioComCursos = async (userId) => {
	const usuario = await model.Usuario.findByPk(userId, {
		include: [
			{
				model: model.Curso,
				as: "cursos",
				through: { attributes: [] }, // Excluir atributos da tabela de junção
			},
		],
	});
	return usuario;
};

// Criar novo usuário
usuarioRepository.criarUsuario = async (dadosUsuario) => {
	const usuario = model.Usuario.build(dadosUsuario);
	await usuario.save();
	return usuario;
};

// Atualizar usuário
usuarioRepository.atualizarUsuario = async (id, dadosUsuario) => {
	const [linhasAfetadas] = await model.Usuario.update(dadosUsuario, {
		where: { id: id },
	});
	return linhasAfetadas > 0;
};

// Deletar usuário
usuarioRepository.deletarUsuario = async (id) => {
	const deleted = await model.Usuario.destroy({
		where: { id: id },
	});
	return deleted > 0;
};

module.exports = usuarioRepository;
