const permissoesService = require("../services/permissoes-service");

const autorizacao = {};

autorizacao.verificarPermissao = (permissaoId) => {
	return async (req, res, next) => {
		try {
			// Verificar se o usuário está autenticado
			if (!req.usuario) {
				return res.status(401).json({
					message: "Usuário não autenticado",
				});
			}

			const userId = req.usuario.id;

			// Converter para array se for número único
			const permissoesIds = Array.isArray(permissaoId)
				? permissaoId
				: [permissaoId];

			// Buscar todas as permissões do usuário
			const permissoesUsuario =
				await permissoesService.buscarPermissoesDoUsuario(userId);

			// Verificar se o usuário tem pelo menos uma das permissões
			for (const idPermissao of permissoesIds) {
				const temPermissao = permissoesUsuario.some(
					(permissao) => permissao.id === idPermissao,
				);

				if (temPermissao) {
					return next(); // Se tem pelo menos uma permissão, permite acesso
				}
			}

			// Se chegou aqui, não tem nenhuma das permissões
			const permissoesStr = permissoesIds.join(" ou ");
			return res.status(403).json({
				message: `Permissão negada: usuário não possui as permissões necessárias (${permissoesStr})`,
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
	autorizacao,
};
