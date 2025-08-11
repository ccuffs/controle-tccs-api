const permissoesService = require("../services/permissoes-service");

const autorizacao = {};

autorizacao.verificarPermissao = (permissaoId) => {
	return async (req, res, next) => {
		try {
			if (!req.usuario) {
				return res
					.status(401)
					.json({ message: "Usuário não autenticado" });
			}

			const userId = req.usuario.id;
			const permissoesIds = Array.isArray(permissaoId)
				? permissaoId
				: [permissaoId];

			const permissoesUsuario =
				await permissoesService.buscarPermissoesDoUsuario(userId);

			for (const idPermissao of permissoesIds) {
				const temPermissao = permissoesUsuario.some(
					(permissao) => permissao.id === idPermissao,
				);
				if (temPermissao) {
					return next();
				}
			}

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

// Middleware específico para autorização por grupos
// Exige que o usuário pertença a pelo menos um dos grupos informados
autorizacao.verificarPermissaoGrupo = (gruposIds = []) => {
	return async (req, res, next) => {
		try {
			if (!req.usuario) {
				return res
					.status(401)
					.json({ message: "Usuário não autenticado" });
			}

			const deveChecarGrupo =
				Array.isArray(gruposIds) && gruposIds.length > 0;
			if (!deveChecarGrupo) {
				return res.status(403).json({ message: "Acesso negado" });
			}

			const gruposUsuario = await permissoesService.buscarGruposDoUsuario(
				req.usuario.id,
			);
			const autorizado = gruposUsuario.some((g) =>
				gruposIds.includes(g.id),
			);

			if (!autorizado) {
				return res.status(403).json({ message: "Permissão negada" });
			}

			return next();
		} catch (error) {
			console.error("Erro ao verificar grupo:", error);
			return res.status(500).json({
				message: "Erro interno do servidor na verificação de grupo",
			});
		}
	};
};

module.exports = {
	autorizacao,
};
