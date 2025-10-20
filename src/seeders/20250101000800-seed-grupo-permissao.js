"use strict";

module.exports = {
	async up(queryInterface, Sequelize) {
		// Admin (grupo 1) - todas as permissões
		const adminPermissions = Array.from({ length: 50 }, (_, i) => ({
			id_grupo: 1,
			id_permissao: i + 1,
			createdAt: new Date(),
			updatedAt: new Date(),
			deletedAt: null,
		}));

		// Professor (grupo 2) - permissões 6-50 exceto algumas
		const professorPermissions = Array.from({ length: 45 }, (_, i) => ({
			id_grupo: 2,
			id_permissao: i + 6,
			createdAt: new Date(),
			updatedAt: new Date(),
			deletedAt: null,
		}));

		// Orientador (grupo 3) - permissões específicas
		const orientadorPermissoes = [1, 11, 14, 16, 17, 21, 22, 23, 24, 25, 26, 30, 31, 32, 33, 36, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50];
		const orientadorPermissions = orientadorPermissoes.map(id => ({
			id_grupo: 3,
			id_permissao: id,
			createdAt: new Date(),
			updatedAt: new Date(),
			deletedAt: null,
		}));

		// Estudante (grupo 4) - permissões limitadas
		const estudantePermissoes = [16, 19, 21, 22, 26, 31, 32, 36, 38, 39, 40, 41, 43, 44, 45, 46, 47, 48, 49, 50];
		const estudantePermissions = estudantePermissoes.map(id => ({
			id_grupo: 4,
			id_permissao: id,
			createdAt: new Date(),
			updatedAt: new Date(),
			deletedAt: null,
		}));

		await queryInterface.bulkInsert(
			"grupo_permissao",
			[
				...adminPermissions,
				...professorPermissions,
				...orientadorPermissions,
				...estudantePermissions,
			],
			{}
		);
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.bulkDelete("grupo_permissao", null, {});
	},
};

