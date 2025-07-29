const model = require("@backend/models");
const authRepository = {};

// Buscar usuário por email com grupos
authRepository.buscarUsuarioPorEmail = async (email) => {
	const usuario = await model.Usuario.findOne({
		where: { email: email },
		include: [
			{
				model: model.Grupo,
				as: "grupos",
				through: { attributes: [] },
			},
		],
	});

	return usuario;
};

// Buscar usuário por ID com grupos e cursos
authRepository.buscarUsuarioPorId = async (userId) => {
	const usuario = await model.Usuario.findByPk(userId, {
		include: [
			{
				model: model.Grupo,
				as: "grupos",
				through: { attributes: [] },
			},
			{
				model: model.Curso,
				as: "cursos",
				through: { attributes: [] },
			},
		],
	});

	return usuario;
};

// Buscar usuário por ID simples
authRepository.buscarUsuarioPorIdSimples = async (userId) => {
	const usuario = await model.Usuario.findByPk(userId);
	return usuario;
};

module.exports = authRepository;
