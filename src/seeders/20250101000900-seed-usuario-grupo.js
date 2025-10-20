"use strict";

module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.bulkInsert(
			"usuario_grupo",
			[
				{
					id_grupo: 1,
					id_usuario: "gian",
					createdAt: new Date(),
					updatedAt: new Date(),
					deletedAt: null,
				},
				{
					id_grupo: 2,
					id_usuario: "claunir.pavan",
					createdAt: new Date(),
					updatedAt: new Date(),
					deletedAt: null,
				},
				{
					id_grupo: 3,
					id_usuario: "lcaimi",
					createdAt: new Date(),
					updatedAt: new Date(),
					deletedAt: null,
				},
				{
					id_grupo: 3,
					id_usuario: "andrei.braga",
					createdAt: new Date(),
					updatedAt: new Date(),
					deletedAt: null,
				},
				{
					id_grupo: 3,
					id_usuario: "felipe.grando",
					createdAt: new Date(),
					updatedAt: new Date(),
					deletedAt: null,
				},
				{
					id_grupo: 3,
					id_usuario: "samuel.feitosa",
					createdAt: new Date(),
					updatedAt: new Date(),
					deletedAt: null,
				},
				{
					id_grupo: 3,
					id_usuario: "braulio",
					createdAt: new Date(),
					updatedAt: new Date(),
					deletedAt: null,
				},
				{
					id_grupo: 3,
					id_usuario: "duarte",
					createdAt: new Date(),
					updatedAt: new Date(),
					deletedAt: null,
				},
				{
					id_grupo: 3,
					id_usuario: "guilherme.dalbianco",
					createdAt: new Date(),
					updatedAt: new Date(),
					deletedAt: null,
				},
				{
					id_grupo: 3,
					id_usuario: "marco.spohn",
					createdAt: new Date(),
					updatedAt: new Date(),
					deletedAt: null,
				},
				{
					id_grupo: 3,
					id_usuario: "raquel.pegoraro",
					createdAt: new Date(),
					updatedAt: new Date(),
					deletedAt: null,
				},
				{
					id_grupo: 3,
					id_usuario: "schreiner.geomar",
					createdAt: new Date(),
					updatedAt: new Date(),
					deletedAt: null,
				},
				{
					id_grupo: 4,
					id_usuario: "ana",
					createdAt: new Date(),
					updatedAt: new Date(),
					deletedAt: null,
				},
				{
					id_grupo: 4,
					id_usuario: "andrei",
					createdAt: new Date(),
					updatedAt: new Date(),
					deletedAt: null,
				},
				{
					id_grupo: 3,
					id_usuario: "gian",
					createdAt: new Date(),
					updatedAt: new Date(),
					deletedAt: null,
				},
				{
					id_grupo: 3,
					id_usuario: "claunir.pavan",
					createdAt: new Date(),
					updatedAt: new Date(),
					deletedAt: null,
				},
			],
			{}
		);
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.bulkDelete("usuario_grupo", null, {});
	},
};

