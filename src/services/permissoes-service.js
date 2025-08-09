const permissoesRepository = require("../repository/permissoes-repository");

/**
 * Busca todas as permissões de um usuário através dos grupos que ele pertence
 * @param {string} userId - ID do usuário
 * @returns {Promise<Array>} Array de permissões com informações de leitura e edição
 */
const buscarPermissoesDoUsuario = async (userId) => {
	try {
		const usuario =
			await permissoesRepository.buscarUsuarioComGruposEPermissoes(
				userId,
			);

		if (!usuario) {
			throw new Error("Usuário não encontrado");
		}

		// Consolidar permissões de todos os grupos
		const permissoesConsolidadas = new Map();

		usuario.grupos.forEach((grupo) => {
			grupo.permissoes.forEach((permissao) => {
				const permissaoId = permissao.id;

				if (!permissoesConsolidadas.has(permissaoId)) {
					permissoesConsolidadas.set(permissaoId, {
						id: permissao.id,
						nome: permissao.nome,
						descricao: permissao.descricao,
						leitura: true, // Se tem a permissão, tem leitura
						edicao: true, // Se tem a permissão, tem edição
						grupos: [],
					});
				}

				const permissaoConsolidada =
					permissoesConsolidadas.get(permissaoId);

				// Adicionar grupo à lista de grupos que concedem esta permissão
				if (
					!permissaoConsolidada.grupos.find((g) => g.id === grupo.id)
				) {
					permissaoConsolidada.grupos.push({
						id: grupo.id,
						nome: grupo.nome,
					});
				}
			});
		});

		return Array.from(permissoesConsolidadas.values());
	} catch (error) {
		console.error("Erro ao buscar permissões do usuário:", error);
		throw error;
	}
};

/**
 * Verifica se um usuário tem uma permissão específica
 * @param {string} userId - ID do usuário
 * @param {string} nomePermissao - Nome da permissão
 * @param {string} acao - 'leitura' ou 'edicao'
 * @returns {Promise<boolean>} true se o usuário tem a permissão
 */
const verificarPermissao = async (userId, nomePermissao, acao = "leitura") => {
	try {
		const permissoes = await buscarPermissoesDoUsuario(userId);
		const permissao = permissoes.find((p) => p.nome === nomePermissao);

		if (!permissao) {
			return false;
		}

		return permissao[acao] === true;
	} catch (error) {
		console.error("Erro ao verificar permissão:", error);
		return false;
	}
};

/**
 * Verifica se um usuário tem permissão de consulta geral
 * @param {string} userId - ID do usuário
 * @returns {Promise<boolean>} true se o usuário tem permissão de consulta geral
 */
const verificarConsultaTodos = async (userId) => {
	try {
		const usuario =
			await permissoesRepository.buscarUsuarioComGrupos(userId);

		if (!usuario) {
			return false;
		}

		// Se o usuário tem grupos, tem permissão de consulta geral
		return usuario.grupos.length > 0;
	} catch (error) {
		console.error("Erro ao verificar consulta_todos:", error);
		return false;
	}
};

/**
 * Busca grupos de um usuário
 * @param {string} userId - ID do usuário
 * @returns {Promise<Array>} Array de grupos do usuário
 */
const buscarGruposDoUsuario = async (userId) => {
	try {
		const usuario =
			await permissoesRepository.buscarUsuarioComGrupos(userId);

		if (!usuario) {
			throw new Error("Usuário não encontrado");
		}

		return usuario.grupos;
	} catch (error) {
		console.error("Erro ao buscar grupos do usuário:", error);
		throw error;
	}
};

/**
 * Busca todas as permissões disponíveis no sistema
 * @returns {Promise<Array>} Array de todas as permissões
 */
const buscarTodasPermissoes = async () => {
	try {
		const permissoes = await permissoesRepository.buscarTodasPermissoes();
		return permissoes;
	} catch (error) {
		console.error("Erro ao buscar todas as permissões:", error);
		throw error;
	}
};

/**
 * Busca todos os grupos disponíveis no sistema
 * @returns {Promise<Array>} Array de todos os grupos
 */
const buscarTodosGrupos = async () => {
	try {
		const grupos = await permissoesRepository.buscarTodosGrupos();
		return grupos;
	} catch (error) {
		console.error("Erro ao buscar todos os grupos:", error);
		throw error;
	}
};

module.exports = {
	buscarPermissoesDoUsuario,
	verificarPermissao,
	verificarConsultaTodos,
	buscarGruposDoUsuario,
	buscarTodasPermissoes,
	buscarTodosGrupos,
};
