"use strict";

module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.bulkInsert(
			"docente_oferta",
			[
				{ ano: 2025, semestre: 2, id_curso: 1, fase: 1, codigo_docente: "ricardo.parizotto", vagas: 4, createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
				{ ano: 2025, semestre: 2, id_curso: 1, fase: 1, codigo_docente: "andrei.braga", vagas: 0, createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
				{ ano: 2025, semestre: 2, id_curso: 1, fase: 1, codigo_docente: "gian", vagas: 5, createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
				{ ano: 2025, semestre: 2, id_curso: 1, fase: 1, codigo_docente: "felipe.grando", vagas: 0, createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
				{ ano: 2025, semestre: 2, id_curso: 1, fase: 1, codigo_docente: "samuel.feitosa", vagas: 3, createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
				{ ano: 2025, semestre: 2, id_curso: 1, fase: 1, codigo_docente: "braulio", vagas: 4, createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
				{ ano: 2025, semestre: 2, id_curso: 1, fase: 1, codigo_docente: "claunir.pavan", vagas: 3, createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
				{ ano: 2025, semestre: 2, id_curso: 1, fase: 1, codigo_docente: "duarte", vagas: 4, createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
				{ ano: 2025, semestre: 2, id_curso: 1, fase: 1, codigo_docente: "guilherme.dalbianco", vagas: 3, createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
				{ ano: 2025, semestre: 2, id_curso: 1, fase: 1, codigo_docente: "marco.spohn", vagas: 5, createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
				{ ano: 2025, semestre: 2, id_curso: 1, fase: 1, codigo_docente: "raquel.pegoraro", vagas: 4, createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
				{ ano: 2025, semestre: 2, id_curso: 1, fase: 1, codigo_docente: "schreiner.geomar", vagas: 4, createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
				{ ano: 2025, semestre: 1, id_curso: 1, fase: 1, codigo_docente: "gian", vagas: 5, createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
				{ ano: 2025, semestre: 1, id_curso: 1, fase: 1, codigo_docente: "andrei.braga", vagas: 0, createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
				{ ano: 2025, semestre: 1, id_curso: 1, fase: 1, codigo_docente: "felipe.grando", vagas: 0, createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
				{ ano: 2025, semestre: 1, id_curso: 1, fase: 1, codigo_docente: "samuel.feitosa", vagas: 3, createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
				{ ano: 2025, semestre: 1, id_curso: 1, fase: 1, codigo_docente: "braulio", vagas: 4, createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
				{ ano: 2025, semestre: 1, id_curso: 1, fase: 1, codigo_docente: "claunir.pavan", vagas: 3, createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
				{ ano: 2025, semestre: 1, id_curso: 1, fase: 1, codigo_docente: "duarte", vagas: 4, createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
				{ ano: 2025, semestre: 1, id_curso: 1, fase: 1, codigo_docente: "guilherme.dalbianco", vagas: 3, createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
				{ ano: 2025, semestre: 1, id_curso: 1, fase: 1, codigo_docente: "lcaimi", vagas: 0, createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
				{ ano: 2025, semestre: 1, id_curso: 1, fase: 1, codigo_docente: "marco.spohn", vagas: 5, createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
				{ ano: 2025, semestre: 1, id_curso: 1, fase: 1, codigo_docente: "raquel.pegoraro", vagas: 4, createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
				{ ano: 2025, semestre: 1, id_curso: 1, fase: 1, codigo_docente: "schreiner.geomar", vagas: 4, createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
				{ ano: 2025, semestre: 2, id_curso: 1, fase: 1, codigo_docente: "lcaimi", vagas: 0, createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
			],
			{}
		);
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.bulkDelete("docente_oferta", null, {});
	},
};

