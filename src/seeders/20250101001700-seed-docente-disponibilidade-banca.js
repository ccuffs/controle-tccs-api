"use strict";

module.exports = {
	async up(queryInterface, Sequelize) {
		// Helper para criar disponibilidades para um docente em múltiplas datas e horários
		const criarDisponibilidades = (
			codigo_docente,
			fase,
			datas,
			horarios,
		) => {
			const disponibilidades = [];
			for (const data of datas) {
				for (const hora of horarios) {
					disponibilidades.push({
						ano: 2025,
						semestre: 2,
						id_curso: 1,
						fase,
						codigo_docente,
						data_defesa: data,
						hora_defesa: hora,
						createdAt: new Date(),
						updatedAt: new Date(),
					});
				}
			}
			return disponibilidades;
		};

		const todasDisponibilidades = [];

		// Gian - Fase 1
		const datasGian1 = [
			"2025-12-11",
			"2025-12-12",
			"2025-12-13",
			"2025-12-14",
			"2025-12-15",
		];
		const horasGian1 = [
			"13:30:00",
			"14:00:00",
			"14:30:00",
			"15:00:00",
			"15:30:00",
			"16:00:00",
			"16:30:00",
			"17:00:00",
			"17:30:00",
			"18:00:00",
			"18:30:00",
			"19:00:00",
			"19:30:00",
			"20:00:00",
			"20:30:00",
			"21:00:00",
			"21:30:00",
		];
		todasDisponibilidades.push(
			...criarDisponibilidades("gian", 1, datasGian1, horasGian1),
		);

		// Gian - Fase 1 - mais datas
		const datasGian1B = ["2025-12-08", "2025-12-09"];
		todasDisponibilidades.push(
			...criarDisponibilidades("gian", 1, datasGian1B, horasGian1),
		);

		// Braulio - Fase 2
		const horariosBraulio = [
			"13:30:00",
			"14:00:00",
			"14:30:00",
			"15:00:00",
			"15:30:00",
			"16:00:00",
			"16:30:00",
			"17:00:00",
			"17:30:00",
			"18:00:00",
			"18:30:00",
			"19:00:00",
			"19:30:00",
			"20:00:00",
			"20:30:00",
			"21:00:00",
			"21:30:00",
		];
		todasDisponibilidades.push(
			...criarDisponibilidades(
				"braulio",
				2,
				["2025-12-01"],
				horariosBraulio,
			),
		);

		// Claunir Pavan - Fase 2
		todasDisponibilidades.push(
			...criarDisponibilidades(
				"claunir.pavan",
				2,
				["2025-12-02"],
				["21:30:00"],
			),
		);
		todasDisponibilidades.push(
			...criarDisponibilidades(
				"claunir.pavan",
				2,
				["2025-12-01"],
				["17:00:00", "17:30:00", "18:00:00"],
			),
		);
		todasDisponibilidades.push(
			...criarDisponibilidades(
				"claunir.pavan",
				2,
				["2025-12-02"],
				["15:30:00", "16:00:00", "16:30:00", "17:00:00"],
			),
		);
		todasDisponibilidades.push(
			...criarDisponibilidades(
				"claunir.pavan",
				2,
				["2025-12-12"],
				["14:30:00", "15:00:00", "16:30:00"],
			),
		);
		todasDisponibilidades.push(
			...criarDisponibilidades(
				"claunir.pavan",
				2,
				["2025-12-13"],
				[
					"13:30:00",
					"14:00:00",
					"14:30:00",
					"15:00:00",
					"15:30:00",
					"16:00:00",
					"16:30:00",
					"17:00:00",
					"17:30:00",
					"18:00:00",
					"18:30:00",
					"19:00:00",
					"19:30:00",
					"20:00:00",
					"20:30:00",
					"21:00:00",
					"21:30:00",
				],
			),
		);

		// Lcaimi - Fase 2
		const datasLcaimi2 = ["2025-12-03", "2025-12-04"];
		const horasLcaimi2 = [
			"13:30:00",
			"14:00:00",
			"14:30:00",
			"15:00:00",
			"15:30:00",
		];
		todasDisponibilidades.push(
			...criarDisponibilidades("lcaimi", 2, datasLcaimi2, horasLcaimi2),
		);

		const horasLcaimi2B = [
			"18:00:00",
			"18:30:00",
			"19:00:00",
			"19:30:00",
			"20:00:00",
			"20:30:00",
			"21:00:00",
			"21:30:00",
		];
		todasDisponibilidades.push(
			...criarDisponibilidades(
				"lcaimi",
				2,
				["2025-12-03"],
				horasLcaimi2B,
			),
		);
		todasDisponibilidades.push(
			...criarDisponibilidades(
				"lcaimi",
				2,
				["2025-12-04"],
				["19:30:00", "20:00:00", "20:30:00", "21:00:00", "21:30:00"],
			),
		);

		todasDisponibilidades.push(
			...criarDisponibilidades(
				"lcaimi",
				2,
				["2025-12-01"],
				[
					"15:00:00",
					"15:30:00",
					"16:00:00",
					"16:30:00",
					"17:00:00",
					"17:30:00",
					"18:00:00",
					"18:30:00",
					"19:00:00",
					"19:30:00",
					"20:00:00",
					"20:30:00",
					"21:00:00",
					"21:30:00",
				],
			),
		);
		todasDisponibilidades.push(
			...criarDisponibilidades(
				"lcaimi",
				2,
				["2025-12-02"],
				[
					"15:00:00",
					"15:30:00",
					"16:00:00",
					"16:30:00",
					"17:00:00",
					"17:30:00",
					"18:00:00",
					"18:30:00",
					"19:00:00",
					"19:30:00",
					"21:30:00",
				],
			),
		);
		todasDisponibilidades.push(
			...criarDisponibilidades(
				"lcaimi",
				2,
				["2025-12-12"],
				["15:30:00", "16:00:00", "16:30:00"],
			),
		);
		todasDisponibilidades.push(
			...criarDisponibilidades(
				"lcaimi",
				2,
				["2025-12-13"],
				["13:30:00", "14:00:00", "15:00:00", "18:00:00"],
			),
		);

		// Braulio - Fase 1
		const horariosBraulio1 = [
			"13:30:00",
			"14:00:00",
			"14:30:00",
			"15:00:00",
			"15:30:00",
			"16:00:00",
			"16:30:00",
			"17:00:00",
			"17:30:00",
			"18:00:00",
			"18:30:00",
			"19:00:00",
			"19:30:00",
			"20:00:00",
			"20:30:00",
			"21:00:00",
			"21:30:00",
		];
		todasDisponibilidades.push(
			...criarDisponibilidades(
				"braulio",
				1,
				["2025-12-08", "2025-12-09"],
				horariosBraulio1,
			),
		);

		// Claunir Pavan - Fase 1
		todasDisponibilidades.push(
			...criarDisponibilidades(
				"claunir.pavan",
				1,
				["2025-12-09"],
				["13:30:00"],
			),
		);
		todasDisponibilidades.push(
			...criarDisponibilidades(
				"claunir.pavan",
				1,
				["2025-12-08"],
				["15:00:00"],
			),
		);
		todasDisponibilidades.push(
			...criarDisponibilidades(
				"claunir.pavan",
				1,
				["2025-12-10"],
				["15:30:00", "16:00:00"],
			),
		);

		const horasClaunir1 = [
			"16:30:00",
			"17:00:00",
			"17:30:00",
			"18:00:00",
			"18:30:00",
			"19:00:00",
			"19:30:00",
			"20:00:00",
			"20:30:00",
			"21:00:00",
			"21:30:00",
		];
		todasDisponibilidades.push(
			...criarDisponibilidades(
				"claunir.pavan",
				1,
				["2025-12-09", "2025-12-10"],
				horasClaunir1,
			),
		);

		const horasClaunir1B = [
			"13:30:00",
			"14:00:00",
			"14:30:00",
			"15:00:00",
			"15:30:00",
			"16:00:00",
			"16:30:00",
			"17:00:00",
			"17:30:00",
			"18:00:00",
			"18:30:00",
			"19:00:00",
			"19:30:00",
			"20:00:00",
			"20:30:00",
			"21:00:00",
			"21:30:00",
		];
		todasDisponibilidades.push(
			...criarDisponibilidades(
				"claunir.pavan",
				1,
				["2025-12-11"],
				horasClaunir1B,
			),
		);

		// Lcaimi - Fase 1
		todasDisponibilidades.push(
			...criarDisponibilidades(
				"lcaimi",
				1,
				["2025-12-08", "2025-12-10"],
				["13:30:00"],
			),
		);
		todasDisponibilidades.push(
			...criarDisponibilidades("lcaimi", 1, ["2025-12-08"], ["16:30:00"]),
		);

		const horasLcaimi1 = [
			"18:30:00",
			"19:00:00",
			"19:30:00",
			"20:00:00",
			"20:30:00",
			"21:00:00",
			"21:30:00",
		];
		todasDisponibilidades.push(
			...criarDisponibilidades("lcaimi", 1, ["2025-12-08"], horasLcaimi1),
		);

		const horasLcaimi1B = [
			"16:00:00",
			"17:00:00",
			"17:30:00",
			"18:00:00",
			"18:30:00",
			"19:00:00",
			"19:30:00",
			"20:00:00",
			"20:30:00",
			"21:00:00",
			"21:30:00",
		];
		todasDisponibilidades.push(
			...criarDisponibilidades(
				"lcaimi",
				1,
				["2025-12-10"],
				horasLcaimi1B,
			),
		);

		// Gian - Fase 2
		const datasGian2 = ["2025-12-01"];
		const horasGian2 = [
			"15:00:00",
			"15:30:00",
			"16:00:00",
			"16:30:00",
			"17:00:00",
			"17:30:00",
			"18:00:00",
			"18:30:00",
			"19:00:00",
			"19:30:00",
			"20:00:00",
			"20:30:00",
			"21:00:00",
			"21:30:00",
		];
		todasDisponibilidades.push(
			...criarDisponibilidades("gian", 2, datasGian2, horasGian2),
		);

		const datasGian2B = ["2025-12-02"];
		const horasGian2B = [
			"13:30:00",
			"14:00:00",
			"14:30:00",
			"15:00:00",
			"15:30:00",
		];
		todasDisponibilidades.push(
			...criarDisponibilidades("gian", 2, datasGian2B, horasGian2B),
		);

		const datasGian2C = ["2025-12-12", "2025-12-13"];
		const horasGian2C = [
			"13:30:00",
			"14:00:00",
			"14:30:00",
			"15:00:00",
			"15:30:00",
			"16:00:00",
			"16:30:00",
			"17:00:00",
			"17:30:00",
			"18:00:00",
			"18:30:00",
			"19:00:00",
			"19:30:00",
			"20:00:00",
			"20:30:00",
			"21:00:00",
			"21:30:00",
		];
		todasDisponibilidades.push(
			...criarDisponibilidades("gian", 2, datasGian2C, horasGian2C),
		);

		// Andrei Braga - Fase 2
		const datasAndrei = ["2025-12-01", "2025-12-02", "2025-12-03"];
		const horasAndrei = [
			"13:30:00",
			"14:00:00",
			"14:30:00",
			"15:00:00",
			"15:30:00",
			"16:00:00",
			"16:30:00",
			"17:00:00",
			"17:30:00",
			"18:00:00",
			"18:30:00",
			"19:00:00",
			"19:30:00",
			"20:00:00",
			"20:30:00",
			"21:00:00",
			"21:30:00",
		];
		todasDisponibilidades.push(
			...criarDisponibilidades(
				"andrei.braga",
				2,
				datasAndrei,
				horasAndrei,
			),
		);

		await queryInterface.bulkInsert(
			"docente_disponibilidade_banca",
			todasDisponibilidades,
			{},
		);
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.bulkDelete(
			"docente_disponibilidade_banca",
			null,
			{},
		);
	},
};
