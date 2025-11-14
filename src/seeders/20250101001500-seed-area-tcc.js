"use strict";

module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.bulkInsert(
			"area_tcc",
			[
				{ id: 1, descricao: "Machine Learning", codigo_docente: "guilherme.dalbianco", createdAt: new Date(), updatedAt: new Date() },
				{ id: 2, descricao: "Linguagens de Programação", codigo_docente: "samuel.feitosa", createdAt: new Date(), updatedAt: new Date() },
				{ id: 3, descricao: "Inteligência Artificial", codigo_docente: "samuel.feitosa", createdAt: new Date(), updatedAt: new Date() },
				{ id: 4, descricao: "Redes de Computadores", codigo_docente: "marco.spohn", createdAt: new Date(), updatedAt: new Date() },
				{ id: 5, descricao: "Modelagem & Simulação de sistemas", codigo_docente: "braulio", createdAt: new Date(), updatedAt: new Date() },
				{ id: 6, descricao: "TCC Startup", codigo_docente: "raquel.pegoraro", createdAt: new Date(), updatedAt: new Date() },
				{ id: 7, descricao: "Engenharia de software e inovação", codigo_docente: "raquel.pegoraro", createdAt: new Date(), updatedAt: new Date() },
				{ id: 8, descricao: "Data analytics - Business Intelligence", codigo_docente: "raquel.pegoraro", createdAt: new Date(), updatedAt: new Date() },
				{ id: 9, descricao: "Grafos e aplicações", codigo_docente: "andrei.braga", createdAt: new Date(), updatedAt: new Date() },
				{ id: 10, descricao: "Pesquisa Operacional", codigo_docente: "andrei.braga", createdAt: new Date(), updatedAt: new Date() },
				{ id: 11, descricao: "Redes Intrachip", codigo_docente: "lcaimi", createdAt: new Date(), updatedAt: new Date() },
				{ id: 12, descricao: "Automação e Controle", codigo_docente: "lcaimi", createdAt: new Date(), updatedAt: new Date() },
				{ id: 13, descricao: "Projeto Digital", codigo_docente: "lcaimi", createdAt: new Date(), updatedAt: new Date() },
				{ id: 14, descricao: "Machine Learning:  PLN Tradicional ou Deep Learning", codigo_docente: "gian", createdAt: new Date(), updatedAt: new Date() },
				{ id: 15, descricao: "Machine learning Tradicional / Deep Learning", codigo_docente: "gian", createdAt: new Date(), updatedAt: new Date() },
				{ id: 16, descricao: "Visão Computacional", codigo_docente: "gian", createdAt: new Date(), updatedAt: new Date() },
				{ id: 17, descricao: "Extração de Esquemas", codigo_docente: "duarte", createdAt: new Date(), updatedAt: new Date() },
				{ id: 18, descricao: "Aprendizado de Máquina N-Sup", codigo_docente: "duarte", createdAt: new Date(), updatedAt: new Date() },
				{ id: 19, descricao: "Aprendizado de Máquina Superv.", codigo_docente: "duarte", createdAt: new Date(), updatedAt: new Date() },
				{ id: 20, descricao: "Redes de Telecomunicações", codigo_docente: "claunir.pavan", createdAt: new Date(), updatedAt: new Date() },
				{ id: 21, descricao: "IoT", codigo_docente: "claunir.pavan", createdAt: new Date(), updatedAt: new Date() },
				{ id: 22, descricao: "Banco de Dados", codigo_docente: "schreiner.geomar", createdAt: new Date(), updatedAt: new Date() },
				{ id: 23, descricao: "Sincronização de BDs", codigo_docente: "schreiner.geomar", createdAt: new Date(), updatedAt: new Date() },
				{ id: 24, descricao: "Modelagem de BD", codigo_docente: "schreiner.geomar", createdAt: new Date(), updatedAt: new Date() },
				{ id: 25, descricao: "Integração de Dados", codigo_docente: "schreiner.geomar", createdAt: new Date(), updatedAt: new Date() },
				{ id: 26, descricao: "Inteligência Artificial", codigo_docente: "felipe.grando", createdAt: new Date(), updatedAt: new Date() },
				{ id: 27, descricao: "Computação distribuída.", codigo_docente: "braulio", createdAt: new Date(), updatedAt: new Date() },
				{ id: 28, descricao: "Segurança", codigo_docente: "ricardo.parizotto", createdAt: new Date(), updatedAt: new Date() },
				{ id: 29, descricao: "Sistemas Distribuídos", codigo_docente: "ricardo.parizotto", createdAt: new Date(), updatedAt: new Date() },
				{ id: 30, descricao: "Redes programáveis ", codigo_docente: "ricardo.parizotto", createdAt: new Date(), updatedAt: new Date() },
			],
			{}
		);
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.bulkDelete("area_tcc", null, {});
	},
};

