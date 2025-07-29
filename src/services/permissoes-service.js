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
				const grupoPermissao = permissao.GrupoPermissao;

				if (!permissoesConsolidadas.has(permissaoId)) {
					permissoesConsolidadas.set(permissaoId, {
						id: permissao.id,
						nome: permissao.nome,
						descricao: permissao.descricao,
						leitura: false,
						edicao: false,
						grupos: [],
					});
				}

				const permissaoConsolidada =
					permissoesConsolidadas.get(permissaoId);

				// Se qualquer grupo permite leitura/edição, o usuário tem a permissão
				if (grupoPermissao.leitura) {
					permissaoConsolidada.leitura = true;
				}
				if (grupoPermissao.edicao) {
					permissaoConsolidada.edicao = true;
				}

				// Adicionar grupo à lista de grupos que concedem esta permissão
				if (
					!permissaoConsolidada.grupos.find((g) => g.id === grupo.id)
				) {
					permissaoConsolidada.grupos.push({
						id: grupo.id,
						nome: grupo.nome,
						consulta_todos: grupo.consulta_todos,
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
 * Verifica se um usuário tem permissão de consulta geral (consulta_todos)
 * @param {string} userId - ID do usuário
 * @returns {Promise<boolean>} true se o usuário tem permissão de consulta geral
 */
const verificarConsultaTodos = async (userId) => {
	try {
		const usuario = await permissoesRepository.buscarUsuarioComGrupos(
			userId,
		);

		if (!usuario) {
			return false;
		}

		// Verifica se qualquer grupo do usuário tem consulta_todos = true
		return usuario.grupos.some((grupo) => grupo.consulta_todos === true);
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
		const usuario = await permissoesRepository.buscarUsuarioComGrupos(
			userId,
		);

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
