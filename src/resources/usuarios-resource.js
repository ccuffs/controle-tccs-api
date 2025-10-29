const express = require("express");
const usuarioService = require("../services/usuarios-service");
const { auth } = require("../middleware/auth");

const usuariosResource = express.Router();

// GET /api/usuarios - Buscar todos os usuários
usuariosResource.get(
	"/",
	auth.autenticarUsuario,
	usuarioService.retornaTodosUsuarios,
);

// GET /api/usuarios/:userId/cursos - Buscar cursos vinculados ao usuário
// IMPORTANTE: Esta rota deve vir ANTES da rota /:userId para evitar conflitos
usuariosResource.get(
	"/:userId/cursos",
	auth.autenticarUsuario,
	usuarioService.retornaCursosDoUsuario,
);

// GET /api/usuarios/:userId - Buscar usuário específico
usuariosResource.get(
	"/:userId",
	auth.autenticarUsuario,
	usuarioService.retornaUsuarioPorId,
);

// POST /api/usuarios - Criar novo usuário
usuariosResource.post("/", auth.autenticarUsuario, usuarioService.criaUsuario);

// PUT /api/usuarios - Atualizar usuário
usuariosResource.put(
	"/",
	auth.autenticarUsuario,
	usuarioService.atualizaUsuario,
);

// DELETE /api/usuarios/:id - Deletar usuário
usuariosResource.delete(
	"/:id",
	auth.autenticarUsuario,
	usuarioService.deletaUsuario,
);

module.exports = usuariosResource;
