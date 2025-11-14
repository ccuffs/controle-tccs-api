"use strict";

module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.bulkInsert(
			"grupo",
			[
				{
					id: 1,
					nome: "admin",
					descricao: "Administrador do sistema.",
					sistema: 2,
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				{
					id: 2,
					nome: "professor",
					descricao: "Professor dos CCRs de TCC I e TCC II.",
					sistema: 2,
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				{
					id: 3,
					nome: "orientador",
					descricao: "Orientador de TCCs.",
					sistema: 2,
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				{
					id: 4,
					nome: "estudante",
					descricao: "Estudante que está cursando TCC I ou TCC II.",
					sistema: 2,
					createdAt: new Date(),
					updatedAt: new Date(),
				},
			],
			{}
		);
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.bulkDelete("grupo", null, {});
	},
};

