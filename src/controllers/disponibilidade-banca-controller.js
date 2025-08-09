const express = require("express");
const disponibilidadeBancaService = require("../services/disponibilidade-banca-service");
const { auth } = require("../middleware/auth");
const { autorizacao } = require("../middleware/autorizacao");
const { Permissoes } = require("../enums/permissoes");

const disponibilidadeBancaRouter = express.Router();

// Buscar todas as disponibilidades
disponibilidadeBancaRouter.get(
	"/",
	auth.autenticarUsuario,
	autorizacao.verificarPermissao([
		Permissoes.DISPONIBILIDADE_BANCA.VISUALIZAR,
		Permissoes.DISPONIBILIDADE_BANCA.VISUALIZAR_TODOS,
	]),
	disponibilidadeBancaService.retornaTodasDisponibilidades,
);

// Buscar disponibilidade específica
disponibilidadeBancaRouter.get(
	"/:ano/:semestre/:id_curso/:fase/:codigo_docente/:data_defesa/:hora_defesa",
	auth.autenticarUsuario,
	autorizacao.verificarPermissao([
		Permissoes.DISPONIBILIDADE_BANCA.VISUALIZAR,
		Permissoes.DISPONIBILIDADE_BANCA.VISUALIZAR_TODOS,
	]),
	disponibilidadeBancaService.retornaDisponibilidade,
);

// Buscar disponibilidades por docente e oferta
disponibilidadeBancaRouter.get(
	"/docente/:codigo_docente/:ano/:semestre/:id_curso/:fase",
	auth.autenticarUsuario,
	autorizacao.verificarPermissao([
		Permissoes.DISPONIBILIDADE_BANCA.VISUALIZAR,
		Permissoes.DISPONIBILIDADE_BANCA.VISUALIZAR_TODOS,
	]),
	disponibilidadeBancaService.retornaDisponibilidadesPorDocenteEOferta,
);

// Buscar grade de disponibilidade para um docente e oferta
disponibilidadeBancaRouter.get(
	"/grade/:codigo_docente/:ano/:semestre/:id_curso/:fase",
	auth.autenticarUsuario,
	autorizacao.verificarPermissao([
		Permissoes.DISPONIBILIDADE_BANCA.VISUALIZAR,
		Permissoes.DISPONIBILIDADE_BANCA.VISUALIZAR_TODOS,
	]),
	disponibilidadeBancaService.retornaGradeDisponibilidade,
);

// Criar nova disponibilidade
disponibilidadeBancaRouter.post(
	"/",
	auth.autenticarUsuario,
	autorizacao.verificarPermissao([
		Permissoes.DISPONIBILIDADE_BANCA.CRIAR,
		Permissoes.DISPONIBILIDADE_BANCA.EDITAR,
	]),
	disponibilidadeBancaService.criaDisponibilidade,
);

// Criar ou atualizar disponibilidade (upsert)
disponibilidadeBancaRouter.post(
	"/upsert",
	auth.autenticarUsuario,
	autorizacao.verificarPermissao([
		Permissoes.DISPONIBILIDADE_BANCA.CRIAR,
		Permissoes.DISPONIBILIDADE_BANCA.EDITAR,
	]),
	disponibilidadeBancaService.criaOuAtualizaDisponibilidade,
);

// Sincronizar múltiplas disponibilidades
disponibilidadeBancaRouter.post(
	"/sincronizar",
	auth.autenticarUsuario,
	autorizacao.verificarPermissao([
		Permissoes.DISPONIBILIDADE_BANCA.CRIAR,
		Permissoes.DISPONIBILIDADE_BANCA.EDITAR,
	]),
	disponibilidadeBancaService.sincronizarDisponibilidades,
);

// Atualizar disponibilidade
disponibilidadeBancaRouter.put(
	"/:ano/:semestre/:id_curso/:fase/:codigo_docente/:data_defesa/:hora_defesa",
	auth.autenticarUsuario,
	autorizacao.verificarPermissao([Permissoes.DISPONIBILIDADE_BANCA.EDITAR]),
	disponibilidadeBancaService.atualizaDisponibilidade,
);

// Deletar disponibilidade
disponibilidadeBancaRouter.delete(
	"/:ano/:semestre/:id_curso/:fase/:codigo_docente/:data_defesa/:hora_defesa",
	auth.autenticarUsuario,
	autorizacao.verificarPermissao([Permissoes.DISPONIBILIDADE_BANCA.DELETAR]),
	disponibilidadeBancaService.deletaDisponibilidade,
);

module.exports = disponibilidadeBancaRouter;
