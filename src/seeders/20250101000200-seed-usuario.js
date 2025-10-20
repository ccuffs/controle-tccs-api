"use strict";

module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.bulkInsert(
			"usuario",
			[
				{
					id: "gian",
					nome: "Giancarlo Salton",
					email: "gian@uffs.edu.br",
					createdAt: new Date(),
					updatedAt: new Date(),
					deletedAt: null,
				},
				{
					id: "claunir.pavan",
					nome: "Claunir Pavan",
					email: "claunir.pavan@uffs.edu.br",
					createdAt: new Date(),
					updatedAt: new Date(),
					deletedAt: null,
				},
				{
					id: "lcaimi",
					nome: "Luciano Lores Caimi",
					email: "lcaimi@uffs.edu.br",
					createdAt: new Date(),
					updatedAt: new Date(),
					deletedAt: null,
				},
				{
					id: "ana",
					nome: "Ana Clara Brusamarello Barbosa",
					email: null,
					createdAt: new Date(),
					updatedAt: new Date(),
					deletedAt: null,
				},
				{
					id: "andrei",
					nome: "Andrei Emerson Horvath Danelli",
					email: null,
					createdAt: new Date(),
					updatedAt: new Date(),
					deletedAt: null,
				},
				{
					id: "andrei.braga",
					nome: "Andrei De Almeida Sampaio Braga",
					email: "andrei.braga@uffs.edu.br",
					createdAt: new Date(),
					updatedAt: new Date(),
					deletedAt: null,
				},
				{
					id: "felipe.grando",
					nome: "Felipe Grando",
					email: "grando@uffs.edu.br",
					createdAt: new Date(),
					updatedAt: new Date(),
					deletedAt: null,
				},
				{
					id: "samuel.feitosa",
					nome: "Samuel Feitosa",
					email: "samuelfeitosa@uffs.edu.br",
					createdAt: new Date(),
					updatedAt: new Date(),
					deletedAt: null,
				},
				{
					id: "braulio",
					nome: "Braulio Adriano de Mello",
					email: "braulio@uffs.edu.br",
					createdAt: new Date(),
					updatedAt: new Date(),
					deletedAt: null,
				},
				{
					id: "duarte",
					nome: "Denio Duarte",
					email: "duarte@uffs.edu.br",
					createdAt: new Date(),
					updatedAt: new Date(),
					deletedAt: null,
				},
				{
					id: "guilherme.dalbianco",
					nome: "Guilherme Dal Bianco",
					email: "guilherme.dalbianco@uffs.edu.br",
					createdAt: new Date(),
					updatedAt: new Date(),
					deletedAt: null,
				},
				{
					id: "marco.spohn",
					nome: "Marco Aurelio Spohn",
					email: "marco.spohn@uffs.edu.br",
					createdAt: new Date(),
					updatedAt: new Date(),
					deletedAt: null,
				},
				{
					id: "raquel.pegoraro",
					nome: "Raquel Aparecida Pegoraro",
					email: "raquel.pegoraro@uffs.edu.br",
					createdAt: new Date(),
					updatedAt: new Date(),
					deletedAt: null,
				},
				{
					id: "schreiner.geomar",
					nome: "Geomar Schreiner",
					email: "schreiner.geomar@uffs.edu.br",
					createdAt: new Date(),
					updatedAt: new Date(),
					deletedAt: null,
				},
				{
					id: "ricardo.parizotto",
					nome: "Ricardo Parizotto",
					email: "ricardo.parizotto@uffs.edu.br",
					createdAt: new Date(),
					updatedAt: new Date(),
					deletedAt: null,
				},
			],
			{}
		);
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.bulkDelete("usuario", null, {});
	},
};

