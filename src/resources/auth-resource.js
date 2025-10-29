const express = require("express");
const authService = require("../services/auth-service");
const { auth } = require("../middleware/auth");

const authResource = express.Router();

/**
 * POST /api/auth/login
 * Realiza o login do usuário
 */
const login = async (req, res) => {
	try {
		const { userId, senha } = req.body;

		// Validação básica
		if (!userId) {
			return res.status(400).json({
				message: "ID do usuário é obrigatório",
			});
		}

		// Realizar login
		const resultado = await authService.fazerLogin(userId, senha);

		res.status(200).json({
			message: "Login realizado com sucesso",
			...resultado,
		});
	} catch (error) {
		console.error("Erro no login:", error);

		if (error.message === "Usuário não encontrado") {
			return res.status(401).json({
				message: "ID do usuário ou senha incorretos",
			});
		}

		if (error.message === "Senha incorreta") {
			return res.status(401).json({
				message: "ID do usuário ou senha incorretos",
			});
		}

		res.status(500).json({
			message: "Erro interno do servidor",
		});
	}
};

/**
 * POST /api/auth/refresh
 * Renova o token JWT
 */
const refreshToken = async (req, res) => {
	try {
		const { token } = req.body;

		if (!token) {
			return res.status(400).json({
				message: "Token é obrigatório",
			});
		}

		// Renovar token
		const novoToken = await authService.renovarToken(token);

		res.status(200).json({
			message: "Token renovado com sucesso",
			token: novoToken,
		});
	} catch (error) {
		console.error("Erro ao renovar token:", error);

		if (error.message === "Token inválido") {
			return res.status(401).json({
				message: "Token inválido ou expirado",
			});
		}

		res.status(500).json({
			message: "Erro interno do servidor",
		});
	}
};

/**
 * GET /api/auth/me
 * Retorna dados do usuário autenticado
 */
const getMe = async (req, res) => {
	try {
		const userId = req.usuario.id;
		const dadosUsuario = await authService.buscarDadosUsuario(userId);

		res.status(200).json({
			message: "Dados do usuário recuperados com sucesso",
			usuario: dadosUsuario,
		});
	} catch (error) {
		console.error("Erro ao buscar dados do usuário:", error);
		res.status(500).json({
			message: "Erro interno do servidor",
		});
	}
};

/**
 * POST /api/auth/logout
 * Logout do usuário (client-side deve remover o token)
 */
const logout = async (req, res) => {
	try {
		// Em um sistema JWT, o logout é principalmente client-side
		// Aqui você pode implementar uma blacklist de tokens se necessário

		res.status(200).json({
			message: "Logout realizado com sucesso",
		});
	} catch (error) {
		console.error("Erro no logout:", error);
		res.status(500).json({
			message: "Erro interno do servidor",
		});
	}
};

/**
 * POST /api/auth/validate
 * Valida um token JWT
 */
const validateToken = async (req, res) => {
	try {
		const { token } = req.body;

		if (!token) {
			return res.status(400).json({
				message: "Token é obrigatório",
			});
		}

		// Validar token
		const payload = authService.validarToken(token);

		res.status(200).json({
			message: "Token válido",
			payload: {
				userId: payload.userId,
				nome: payload.nome,
				exp: payload.exp,
			},
		});
	} catch (error) {
		console.error("Erro ao validar token:", error);

		if (error.message === "Token inválido") {
			return res.status(401).json({
				message: "Token inválido ou expirado",
			});
		}

		res.status(500).json({
			message: "Erro interno do servidor",
		});
	}
};

// Rotas
authResource.post("/login", login);
authResource.post("/refresh", refreshToken);
authResource.get("/me", auth.autenticarUsuario, getMe);
authResource.post("/logout", auth.autenticarUsuario, logout);
authResource.post("/validate", validateToken);

module.exports = authResource;
