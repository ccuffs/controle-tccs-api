const express = require("express");
const usuarioService = require("../services/usuarios-service");
const { auth } = require("../middleware/auth");
const { autorizacao } = require("../middleware/autorizacao");
const usuariosService = express.Router();

// GET /api/usuarios - Buscar todos os usuários
usuariosService.get(
	"/",
	auth.autenticarUsuario,
	usuarioService.retornaTodosUsuarios,
);

// GET /api/usuarios/:userId/cursos - Buscar cursos vinculados ao usuário
// IMPORTANTE: Esta rota deve vir ANTES da rota /:userId para evitar conflitos
usuariosService.get(
	"/:userId/cursos",
	auth.autenticarUsuario,
	usuarioService.retornaCursosDoUsuario,
);

// GET /api/usuarios/:userId - Buscar usuário específico
usuariosService.get(
	"/:userId",
	auth.autenticarUsuario,
	usuarioService.retornaUsuarioPorId,
);

// POST /api/usuarios - Criar novo usuário
usuariosService.post("/", auth.autenticarUsuario, usuarioService.criaUsuario);

// PUT /api/usuarios - Atualizar usuário
usuariosService.put(
	"/",
	auth.autenticarUsuario,
	usuarioService.atualizaUsuario,
);

// DELETE /api/usuarios/:id - Deletar usuário
usuariosService.delete(
	"/:id",
	auth.autenticarUsuario,
	usuarioService.deletaUsuario,
);

module.exports = usuariosService;
