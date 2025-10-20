"use strict";

module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.bulkInsert(
			"permissao",
			[
				{ id: 1, codigo: "VISUALIZAR_CURSO", descricao: "Visualizar", codigo_categoria_permissao: "CURSO", createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
				{ id: 2, codigo: "VISUALIZAR_TODOS_CURSOS", descricao: "Visualizar", codigo_categoria_permissao: "CURSO", createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
				{ id: 3, codigo: "CRIAR_CURSO", descricao: "Criar", codigo_categoria_permissao: "CURSO", createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
				{ id: 4, codigo: "EDITAR_CURSO", descricao: "Editar", codigo_categoria_permissao: "CURSO", createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
				{ id: 5, codigo: "DELETAR_CURSO", descricao: "Deletar", codigo_categoria_permissao: "CURSO", createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
				{ id: 6, codigo: "VISUALIZAR_ORIENTADORES", descricao: "Visualizar", codigo_categoria_permissao: "ORIENTADORES", createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
				{ id: 7, codigo: "VISUALIZAR_TODOS_ORIENTADORES", descricao: "Visualizar", codigo_categoria_permissao: "ORIENTADORES", createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
				{ id: 8, codigo: "CRIAR_ORIENTADOR", descricao: "Criar", codigo_categoria_permissao: "ORIENTADORES", createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
				{ id: 9, codigo: "EDITAR_ORIENTADOR", descricao: "Editar", codigo_categoria_permissao: "ORIENTADORES", createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
				{ id: 10, codigo: "DELETAR_ORIENTADOR", descricao: "Deletar", codigo_categoria_permissao: "ORIENTADORES", createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
				{ id: 11, codigo: "VISUALIZAR_ORIENTACOES", descricao: "Visualizar", codigo_categoria_permissao: "ORIENTACOES", createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
				{ id: 12, codigo: "VISUALIZAR_TODAS_ORIENTACOES", descricao: "Visualizar", codigo_categoria_permissao: "ORIENTACOES", createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
				{ id: 13, codigo: "CRIAR_ORIENTACAO", descricao: "Criar", codigo_categoria_permissao: "ORIENTACOES", createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
				{ id: 14, codigo: "EDITAR_ORIENTACAO", descricao: "Editar", codigo_categoria_permissao: "ORIENTACOES", createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
				{ id: 15, codigo: "DELETAR_ORIENTACAO", descricao: "Deletar", codigo_categoria_permissao: "ORIENTACOES", createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
				{ id: 16, codigo: "VISUALIZAR_DICENTES", descricao: "Visualizar", codigo_categoria_permissao: "DICENTES", createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
				{ id: 17, codigo: "VISUALIZAR_TODOS_DICENTES", descricao: "Visualizar", codigo_categoria_permissao: "DICENTES", createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
				{ id: 18, codigo: "CRIAR_DICENTE", descricao: "Criar", codigo_categoria_permissao: "DICENTES", createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
				{ id: 19, codigo: "EDITAR_DICENTE", descricao: "Editar", codigo_categoria_permissao: "DICENTES", createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
				{ id: 20, codigo: "DELETAR_DICENTE", descricao: "Deletar", codigo_categoria_permissao: "DICENTES", createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
				{ id: 21, codigo: "VISUALIZAR_TEMAS_TCC", descricao: "Visualizar", codigo_categoria_permissao: "TEMAS-TCC", createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
				{ id: 22, codigo: "VISUALIZAR_TODOS_TEMAS_TCC", descricao: "Visualizar", codigo_categoria_permissao: "TEMAS-TCC", createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
				{ id: 23, codigo: "CRIAR_TEMA_TCC", descricao: "Criar", codigo_categoria_permissao: "TEMAS-TCC", createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
				{ id: 24, codigo: "EDITAR_TEMA_TCC", descricao: "Editar", codigo_categoria_permissao: "TEMAS-TCC", createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
				{ id: 25, codigo: "DELETAR_TEMA_TCC", descricao: "Deletar", codigo_categoria_permissao: "TEMAS-TCC", createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
				{ id: 26, codigo: "VISUALIZAR_OFERTAS", descricao: "Visualizar", codigo_categoria_permissao: "OFERTAS-TCC", createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
				{ id: 27, codigo: "VISUALIZAR_TODAS_OFERTAS", descricao: "Visualizar", codigo_categoria_permissao: "OFERTAS-TCC", createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
				{ id: 28, codigo: "CRIAR_OFERTA", descricao: "Criar", codigo_categoria_permissao: "OFERTAS-TCC", createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
				{ id: 29, codigo: "EDITAR_OFERTA", descricao: "Editar", codigo_categoria_permissao: "OFERTAS-TCC", createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
				{ id: 30, codigo: "DELETAR_OFERTA", descricao: "Deletar", codigo_categoria_permissao: "OFERTAS-TCC", createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
				{ id: 31, codigo: "VISUALIZAR_AREAS_TCC", descricao: "Visualizar", codigo_categoria_permissao: "AREAS-TCC", createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
				{ id: 32, codigo: "VISUALIZAR_TODAS_AREAS_TCC", descricao: "Visualizar", codigo_categoria_permissao: "AREAS-TCC", createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
				{ id: 33, codigo: "CRIAR_AREA_TCC", descricao: "Criar", codigo_categoria_permissao: "AREAS-TCC", createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
				{ id: 34, codigo: "EDITAR_AREA_TCC", descricao: "Editar", codigo_categoria_permissao: "AREAS-TCC", createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
				{ id: 35, codigo: "DELETAR_AREA_TCC", descricao: "Deletar", codigo_categoria_permissao: "AREAS-TCC", createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
				{ id: 36, codigo: "VISUALIZAR_TRABALHO_CONCLUSAO", descricao: "Visualizar", codigo_categoria_permissao: "TRABALHO-CONCLUSAO", createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
				{ id: 37, codigo: "VISUALIZAR_TODOS_TRABALHO_CONCLUSAO", descricao: "Visualizar", codigo_categoria_permissao: "TRABALHO-CONCLUSAO", createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
				{ id: 38, codigo: "CRIAR_TRABALHO_CONCLUSAO", descricao: "Criar", codigo_categoria_permissao: "TRABALHO-CONCLUSAO", createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
				{ id: 39, codigo: "EDITAR_TRABALHO_CONCLUSAO", descricao: "Editar", codigo_categoria_permissao: "TRABALHO-CONCLUSAO", createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
				{ id: 40, codigo: "DELETAR_TRABALHO_CONCLUSAO", descricao: "Deletar", codigo_categoria_permissao: "TRABALHO-CONCLUSAO", createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
				{ id: 41, codigo: "VISUALIZAR_CONVITE", descricao: "Visualizar", codigo_categoria_permissao: "CONVITE", createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
				{ id: 42, codigo: "VISUALIZAR_TODOS_CONVITES", descricao: "Visualizar", codigo_categoria_permissao: "CONVITE", createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
				{ id: 43, codigo: "CRIAR_CONVITE", descricao: "Criar", codigo_categoria_permissao: "CONVITE", createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
				{ id: 44, codigo: "EDITAR_CONVITE", descricao: "Editar", codigo_categoria_permissao: "CONVITE", createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
				{ id: 45, codigo: "DELETAR_CONVITE", descricao: "Deletar", codigo_categoria_permissao: "CONVITE", createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
				{ id: 46, codigo: "VISUALIZAR_DISPONIBILIDADE_BANCA", descricao: "Visualizar", codigo_categoria_permissao: "DISPONIBILIDADE-BANCA", createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
				{ id: 47, codigo: "VISUALIZAR_TODAS_DISPONIBILIDADES_BANCAS", descricao: "Visualizar", codigo_categoria_permissao: "DISPONIBILIDADE-BANCA", createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
				{ id: 48, codigo: "CRIAR_DISPONIBILIDADE_BANCA", descricao: "Criar", codigo_categoria_permissao: "DISPONIBILIDADE-BANCA", createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
				{ id: 49, codigo: "EDITAR_DISPONIBILIDADE_BANCA", descricao: "Editar", codigo_categoria_permissao: "DISPONIBILIDADE-BANCA", createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
				{ id: 50, codigo: "DELETAR_DISPONIBILIDADE_BANCA", descricao: "Deletar", codigo_categoria_permissao: "DISPONIBILIDADE-BANCA", createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
			],
			{}
		);
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.bulkDelete("permissao", null, {});
	},
};

