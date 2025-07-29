const jwt = require("jsonwebtoken");
const model = require("@backend/models");
const permissoesService = require("./permissoes-service");

/**
 * Gera um token JWT para o usuário
 * @param {Object} usuario - Objeto do usuário
 * @returns {string} Token JWT
 */
const gerarToken = (usuario) => {
	const payload = {
		userId: usuario.id,
		email: usuario.email,
		nome: usuario.nome,
		iat: Math.floor(Date.now() / 1000), // Issued at
		exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, // Expira em 7 dias
	};

	return jwt.sign(
		payload,
		process.env.JWT_SECRET || "sua-chave-secreta-padrao",
		{
			algorithm: "HS256",
		},
	);
};

/**
 * Realiza o login do usuário
 * @param {string} email - Email do usuário
 * @param {string} senha - Senha do usuário (se aplicável)
 * @returns {Object} Objeto com token e dados básicos do usuário
 */
const fazerLogin = async (email, senha = null) => {
	try {
		// Buscar usuário pelo email
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

		if (!usuario) {
			throw new Error("Usuário não encontrado");
		}

		// Aqui você pode adicionar validação de senha se necessário
		// Por exemplo, se tiver um campo senha no modelo Usuario:
		// if (senha && !bcrypt.compareSync(senha, usuario.senha)) {
		//     throw new Error('Senha incorreta');
		// }

		// Gerar token
		const token = gerarToken(usuario);

		// Retornar dados básicos do usuário e token
		// Permissões serão buscadas apenas quando necessário
		return {
			token,
			usuario: {
				id: usuario.id,
				nome: usuario.nome,
				email: usuario.email,
				grupos: usuario.grupos.map((grupo) => ({
					id: grupo.id,
					nome: grupo.nome,
					descricao: grupo.descricao,
					consulta_todos: grupo.consulta_todos,
				})),
			},
		};
	} catch (error) {
		console.error("Erro no login:", error);
		throw error;
	}
};

/**
 * Valida um token JWT
 * @param {string} token - Token JWT
 * @returns {Object} Payload do token se válido
 */
const validarToken = (token) => {
	try {
		const payload = jwt.verify(
			token,
			process.env.JWT_SECRET || "sua-chave-secreta-padrao",
			{
				algorithms: ["HS256"],
			},
		);
		return payload;
	} catch (error) {
		console.error("Erro ao validar token:", error);
		throw new Error("Token inválido");
	}
};

/**
 * Renova um token JWT
 * @param {string} token - Token atual
 * @returns {string} Novo token
 */
const renovarToken = async (token) => {
	try {
		const payload = validarToken(token);

		// Buscar usuário atualizado
		const usuario = await model.Usuario.findByPk(payload.userId);

		if (!usuario) {
			throw new Error("Usuário não encontrado");
		}

		// Gerar novo token
		return gerarToken(usuario);
	} catch (error) {
		console.error("Erro ao renovar token:", error);
		throw error;
	}
};

/**
 * Busca dados completos do usuário autenticado
 * @param {string} userId - ID do usuário
 * @returns {Object} Dados completos do usuário
 */
const buscarDadosUsuario = async (userId) => {
	try {
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

		if (!usuario) {
			throw new Error("Usuário não encontrado");
		}

		const permissoes = await permissoesService.buscarPermissoesDoUsuario(
			userId,
		);
		const temConsultaTodos = await permissoesService.verificarConsultaTodos(
			userId,
		);

		return {
			id: usuario.id,
			nome: usuario.nome,
			email: usuario.email,
			grupos: usuario.grupos,
			cursos: usuario.cursos,
			permissoes: permissoes,
			temConsultaTodos,
		};
	} catch (error) {
		console.error("Erro ao buscar dados do usuário:", error);
		throw error;
	}
};

/**
 * Busca apenas as permissões do usuário (otimizado para lazy loading)
 * @param {string} userId - ID do usuário
 * @returns {Object} Dados de permissões do usuário
 */
const buscarPermissoesUsuario = async (userId) => {
	try {
		const permissoes = await permissoesService.buscarPermissoesDoUsuario(
			userId,
		);
		const temConsultaTodos = await permissoesService.verificarConsultaTodos(
			userId,
		);

		return {
			permissoes,
			temConsultaTodos,
		};
	} catch (error) {
		console.error("Erro ao buscar permissões do usuário:", error);
		throw error;
	}
};

module.exports = {
	fazerLogin,
	gerarToken,
	validarToken,
	renovarToken,
	buscarDadosUsuario,
	buscarPermissoesUsuario,
};
