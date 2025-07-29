const permissoesService = require("@backend/services/permissoes-service");

/**
 * Middleware para verificar se o usuário tem uma permissão específica
 * @param {string} nomePermissao - Nome da permissão a ser verificada
 * @param {string|Array} acao - 'leitura', 'edicao' ou array de ações ['leitura', 'edicao']
 * @returns {Function} Middleware function
 */
const verificarPermissao = (nomePermissao, acao = "leitura") => {
	return async (req, res, next) => {
		try {
			// Verificar se o usuário está autenticado
			if (!req.usuario) {
				return res.status(401).json({
					message: "Usuário não autenticado",
				});
			}

			const userId = req.usuario.id;

			// Converter para array se for string
			const acoes = Array.isArray(acao) ? acao : [acao];

			// Verificar se o usuário tem pelo menos uma das ações
			for (const acaoAtual of acoes) {
				const temPermissao = await permissoesService.verificarPermissao(
					userId,
					nomePermissao,
					acaoAtual,
				);

				if (temPermissao) {
					return next(); // Se tem pelo menos uma permissão, permite acesso
				}
			}

			// Se chegou aqui, não tem nenhuma das permissões
			const acoesStr = acoes.join(" ou ");
			return res.status(403).json({
				message: `Permissão negada: ${acoesStr} em ${nomePermissao}`,
			});
		} catch (error) {
			console.error("Erro ao verificar permissão:", error);
			return res.status(500).json({
				message: "Erro interno do servidor na verificação de permissão",
			});
		}
	};
};

module.exports = {
	verificarPermissao,
};
