const jwt = require("jsonwebtoken");
const authRepository = require("../repository/auth-repository");
const permissoesService = require("./permissoes-service");
const { passport } = require("../middleware/auth");

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
 * Verifica se a autenticação LDAP está habilitada
 * @returns {boolean} True se LDAP está habilitado
 */
const isLdapEnabled = () => {
	const enabled = process.env.LDAP_ENABLED;
	// Considera habilitado se a variável não existir ou for 'true'
	return enabled === undefined || enabled === "true" || enabled === "1";
};

/**
 * Autentica o usuário via LDAP
 * @param {string} userId - ID do usuário (username LDAP)
 * @param {string} senha - Senha do usuário
 * @returns {Promise<Object>} Dados do usuário do LDAP se autenticado
 */
const autenticarLdap = (userId, senha) => {
	return new Promise((resolve, reject) => {
		const req = {
			body: {
				username: userId,
				password: senha,
			},
		};

		passport.authenticate(
			"ldapauth",
			{ session: false },
			(err, user, info) => {
				if (err) {
					return reject(err);
				}

				if (!user) {
					return reject(new Error("Credenciais inválidas"));
				}

				resolve(user);
			},
		)(req);
	});
};

const fazerLogin = async (userId, senha = null) => {
	try {
		// Verificar se LDAP está habilitado
		const ldapEnabled = isLdapEnabled();

		if (ldapEnabled) {
			// Validar que a senha foi fornecida quando LDAP está habilitado
			if (!senha) {
				throw new Error("Senha é obrigatória");
			}

			// Autenticar via LDAP
			const dadosLdap = await autenticarLdap(userId, senha);

			// Buscar usuário no banco de dados pelo ID retornado do LDAP
			const usuario = await authRepository.buscarUsuarioPorId(
				dadosLdap.id,
			);

			if (!usuario) {
				throw new Error("Usuário não encontrado");
			}

			// Gerar token
			const token = gerarToken(usuario);

			// Retornar dados básicos do usuário e token
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
		} else {
			// LDAP desabilitado - autenticação sem senha (modo desenvolvimento)
			console.warn(
				"ATENÇÃO: LDAP desabilitado - autenticação sem validação de senha",
			);

			// Buscar usuário no banco de dados pelo ID
			const usuario = await authRepository.buscarUsuarioPorId(userId);

			if (!usuario) {
				throw new Error("Usuário não encontrado");
			}

			// Gerar token
			const token = gerarToken(usuario);

			// Retornar dados básicos do usuário e token
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
		}
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
		const usuario = await authRepository.buscarUsuarioPorIdSimples(
			payload.userId,
		);

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
		const usuario = await authRepository.buscarUsuarioPorId(userId);

		if (!usuario) {
			throw new Error("Usuário não encontrado");
		}

		const permissoes =
			await permissoesService.buscarPermissoesDoUsuario(userId);
		const temConsultaTodos =
			await permissoesService.verificarConsultaTodos(userId);

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
		const permissoes =
			await permissoesService.buscarPermissoesDoUsuario(userId);
		const temConsultaTodos =
			await permissoesService.verificarConsultaTodos(userId);

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
