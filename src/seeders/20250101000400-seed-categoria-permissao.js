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
				},
				{
					codigo: "ORIENTADORES",
					descricao: "Tela de orientadores.",
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				{
					codigo: "ORIENTACOES",
					descricao: "Tela de orientações.",
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				{
					codigo: "DICENTES",
					descricao: "Tela de dicentes.",
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				{
					codigo: "TEMAS-TCC",
					descricao: "Tela de temas de tcc.",
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				{
					codigo: "AREAS-TCC",
					descricao: "Areas para temas de TCC.",
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				{
					codigo: "OFERTAS-TCC",
					descricao: "Tela de ofertas do CCR de TCC.",
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				{
					codigo: "TRABALHO-CONCLUSAO",
					descricao: "Edição de trabalhos de conclusão.",
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				{
					codigo: "CONVITE",
					descricao: "Tela de convites.",
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				{
					codigo: "DISPONIBILIDADE-BANCA",
					descricao: "Tela de disponibilidade de banca.",
					createdAt: new Date(),
					updatedAt: new Date(),
				},
			],
			{}
		);
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.bulkDelete("categoria_permissao", null, {});
	},
};

