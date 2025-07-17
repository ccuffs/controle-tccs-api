const express = require("express");
const usuarioService = require("../services/usuarios-service");
const usuariosService = express.Router();

// GET /api/usuarios - Buscar todos os usuários
usuariosService.get("/", usuarioService.retornaTodosUsuarios);

// GET /api/usuarios/:userId/cursos - Buscar cursos vinculados ao usuário
// IMPORTANTE: Esta rota deve vir ANTES da rota /:userId para evitar conflitos
usuariosService.get("/:userId/cursos", usuarioService.retornaCursosDoUsuario);

// GET /api/usuarios/:userId - Buscar usuário específico
usuariosService.get("/:userId", usuarioService.retornaUsuarioPorId);

// POST /api/usuarios - Criar novo usuário
usuariosService.post("/", usuarioService.criaUsuario);

// PUT /api/usuarios - Atualizar usuário
usuariosService.put("/", usuarioService.atualizaUsuario);

// DELETE /api/usuarios/:id - Deletar usuário
usuariosService.delete("/:id", usuarioService.deletaUsuario);

module.exports = usuariosService;