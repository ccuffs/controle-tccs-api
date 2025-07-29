const model = require("@backend/models");
const permissoesRepository = {};

// Buscar usuário com grupos e permissões
permissoesRepository.buscarUsuarioComGruposEPermissoes = async (userId) => {
	const usuario = await model.Usuario.findByPk(userId, {
		include: [
			{
				model: model.Grupo,
				as: "grupos",
				through: { attributes: [] },
				include: [
					{
						model: model.Permissao,
						as: "permissoes",
						through: { attributes: [] },
					},
				],
			},
		],
	});
	return usuario;
};

// Buscar usuário com grupos
permissoesRepository.buscarUsuarioComGrupos = async (userId) => {
	const usuario = await model.Usuario.findByPk(userId, {
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

// Buscar todas as permissões
permissoesRepository.buscarTodasPermissoes = async () => {
	const permissoes = await model.Permissao.findAll({
		order: [["nome", "ASC"]],
	});
	return permissoes;
};

// Buscar todos os grupos
permissoesRepository.buscarTodosGrupos = async () => {
	const grupos = await model.Grupo.findAll({
		order: [["nome", "ASC"]],
	});
	return grupos;
};

module.exports = permissoesRepository;
