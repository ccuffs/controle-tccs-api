"use strict";

module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.bulkInsert(
			"categoria_permissao",
			[
				{
					codigo: "CURSO",
					descricao: "Tela de cursos.",
					createdAt: new Date(),
					updatedAt: new Date(),
					deletedAt: null,
				},
				{
					codigo: "ORIENTADORES",
					descricao: "Tela de orientadores.",
					createdAt: new Date(),
					updatedAt: new Date(),
					deletedAt: null,
				},
				{
					codigo: "ORIENTACOES",
					descricao: "Tela de orientações.",
					createdAt: new Date(),
					updatedAt: new Date(),
					deletedAt: null,
				},
				{
					codigo: "DICENTES",
					descricao: "Tela de dicentes.",
					createdAt: new Date(),
					updatedAt: new Date(),
					deletedAt: null,
				},
				{
					codigo: "TEMAS-TCC",
					descricao: "Tela de temas de tcc.",
					createdAt: new Date(),
					updatedAt: new Date(),
					deletedAt: null,
				},
				{
					codigo: "AREAS-TCC",
					descricao: "Areas para temas de TCC.",
					createdAt: new Date(),
					updatedAt: new Date(),
					deletedAt: null,
				},
				{
					codigo: "OFERTAS-TCC",
					descricao: "Tela de ofertas do CCR de TCC.",
					createdAt: new Date(),
					updatedAt: new Date(),
					deletedAt: null,
				},
				{
					codigo: "TRABALHO-CONCLUSAO",
					descricao: "Edição de trabalhos de conclusão.",
					createdAt: new Date(),
					updatedAt: new Date(),
					deletedAt: null,
				},
				{
					codigo: "CONVITE",
					descricao: "Tela de convites.",
					createdAt: new Date(),
					updatedAt: new Date(),
					deletedAt: null,
				},
				{
					codigo: "DISPONIBILIDADE-BANCA",
					descricao: "Tela de disponibilidade de banca.",
					createdAt: new Date(),
					updatedAt: new Date(),
					deletedAt: null,
				},
			],
			{}
		);
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.bulkDelete("categoria_permissao", null, {});
	},
};

