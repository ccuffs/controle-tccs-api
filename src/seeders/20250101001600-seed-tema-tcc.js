"use strict";

module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.bulkInsert(
			"tema_tcc",
			[
				{ id: 1, descricao: "Como melhorar o treinamento de modelos de linguagem com anotadores de diferentes perfis geograficos e sociais", id_area_tcc: 1, codigo_docente: "guilherme.dalbianco", ativo: true, createdAt: new Date(), updatedAt: new Date() },
				{ id: 2, descricao: "IA em esportes de alto rendimento ", id_area_tcc: 1, codigo_docente: "guilherme.dalbianco", ativo: true, createdAt: new Date(), updatedAt: new Date() },
				{ id: 3, descricao: "IA em dados da saúde", id_area_tcc: 1, codigo_docente: "guilherme.dalbianco", ativo: true, createdAt: new Date(), updatedAt: new Date() },
				{ id: 4, descricao: "Geração de código / implementação de linguagens de programação.", id_area_tcc: 2, codigo_docente: "samuel.feitosa", ativo: true, createdAt: new Date(), updatedAt: new Date() },
				{ id: 5, descricao: "Aplicação de IA na área da saúde / Geração de código com LLMs.", id_area_tcc: 3, codigo_docente: "samuel.feitosa", ativo: true, createdAt: new Date(), updatedAt: new Date() },
				{ id: 6, descricao: "Diversos sub-projetos relacionados ao protocolo MQTT", id_area_tcc: 4, codigo_docente: "marco.spohn", ativo: true, createdAt: new Date(), updatedAt: new Date() },
				{ id: 7, descricao: "Redes quânticas: realizar um levantamento sistemático da literatura (survey)", id_area_tcc: 4, codigo_docente: "marco.spohn", ativo: true, createdAt: new Date(), updatedAt: new Date() },
				{ id: 8, descricao: "Distribuição de chave quântica: realizar um levantamento sistemático da literatura (survey)", id_area_tcc: 4, codigo_docente: "marco.spohn", ativo: true, createdAt: new Date(), updatedAt: new Date() },
				{ id: 9, descricao: "Projetos relacionados com problemas de sincronização do tempo em modelos distribuídos, composição de modelos, aplicações da simulação computacional.", id_area_tcc: 5, codigo_docente: "braulio", ativo: true, createdAt: new Date(), updatedAt: new Date() },
				{ id: 10, descricao: "Cada projeto irá ter uma proposta específica a ser definida com o aluno", id_area_tcc: 6, codigo_docente: "raquel.pegoraro", ativo: true, createdAt: new Date(), updatedAt: new Date() },
				{ id: 11, descricao: "Projetos relacionadas a resolução de problemas ou desenvolvimento de solução em áreas de inovação e negócio de empresas de software/startups.", id_area_tcc: 7, codigo_docente: "raquel.pegoraro", ativo: true, createdAt: new Date(), updatedAt: new Date() },
				{ id: 12, descricao: "Desenvolvimento de soluções de data analytics", id_area_tcc: 8, codigo_docente: "raquel.pegoraro", ativo: true, createdAt: new Date(), updatedAt: new Date() },
				{ id: 13, descricao: "Estudo de problemas e algoritmos envolvendo grafos", id_area_tcc: 9, codigo_docente: "andrei.braga", ativo: true, createdAt: new Date(), updatedAt: new Date() },
				{ id: 14, descricao: "Estudo de problemas e soluções envolvendo Pesquisa Operacional", id_area_tcc: 10, codigo_docente: "andrei.braga", ativo: true, createdAt: new Date(), updatedAt: new Date() },
				{ id: 15, descricao: "Segurança em redes intra chip", id_area_tcc: 11, codigo_docente: "lcaimi", ativo: true, createdAt: new Date(), updatedAt: new Date() },
				{ id: 16, descricao: "Automação de equipamentos ou processos", id_area_tcc: 12, codigo_docente: "lcaimi", ativo: true, createdAt: new Date(), updatedAt: new Date() },
				{ id: 17, descricao: "Estudo comparativo de novas linguagens de descrição de hardware", id_area_tcc: 13, codigo_docente: "lcaimi", ativo: true, createdAt: new Date(), updatedAt: new Date() },
				{ id: 18, descricao: "Processamento de Linguagem Natural: Sumarização de Textos; Simplificação de textos; Modelos de Linguagem; Detecção de tipos de texto (humor, propaganda, fakenews, etc); Análise de sentimentos; Extração de informações; Detecção de plágio; Análise de discurso; Processamento de fala.", id_area_tcc: 14, codigo_docente: "gian", ativo: true, createdAt: new Date(), updatedAt: new Date() },
				{ id: 19, descricao: "Estudos e aplicações de LMs e LLMs", id_area_tcc: 14, codigo_docente: "gian", ativo: true, createdAt: new Date(), updatedAt: new Date() },
				{ id: 20, descricao: "Aplicações de machine learning", id_area_tcc: 15, codigo_docente: "gian", ativo: true, createdAt: new Date(), updatedAt: new Date() },
				{ id: 21, descricao: "Análise de dados / Ciência de Dados", id_area_tcc: 15, codigo_docente: "gian", ativo: true, createdAt: new Date(), updatedAt: new Date() },
				{ id: 22, descricao: "Explainable AI (xAI): estudo para entendimento do que os modelos, especialmente redes neurais, aprendem.", id_area_tcc: 15, codigo_docente: "gian", ativo: true, createdAt: new Date(), updatedAt: new Date() },
				{ id: 23, descricao: "Processamento de Imagens Tradicional ou com Machine Learning", id_area_tcc: 16, codigo_docente: "gian", ativo: true, createdAt: new Date(), updatedAt: new Date() },
				{ id: 24, descricao: "Extração de esquemas de dados não e semi-estruturados (NoSQL)", id_area_tcc: 17, codigo_docente: "duarte", ativo: true, createdAt: new Date(), updatedAt: new Date() },
				{ id: 25, descricao: "Extração de estrutura de textos gerados por usuários", id_area_tcc: 18, codigo_docente: "duarte", ativo: true, createdAt: new Date(), updatedAt: new Date() },
				{ id: 26, descricao: "Geração de modelos de predição para aplicações reais", id_area_tcc: 19, codigo_docente: "duarte", ativo: true, createdAt: new Date(), updatedAt: new Date() },
				{ id: 27, descricao: "Dimensionamento e Otimização de Redes Ópticas de Telecomunicações", id_area_tcc: 20, codigo_docente: "claunir.pavan", ativo: true, createdAt: new Date(), updatedAt: new Date() },
				{ id: 28, descricao: "Aprendizado de Máquina aplicado a problemas de sensoriamento com sensores em fibra óptica", id_area_tcc: 21, codigo_docente: "claunir.pavan", ativo: true, createdAt: new Date(), updatedAt: new Date() },
				{ id: 29, descricao: "Tópicos relacionados a Bancos Relacionais, NoSQL, NewSQL e BDs de Fluxo", id_area_tcc: 22, codigo_docente: "schreiner.geomar", ativo: true, createdAt: new Date(), updatedAt: new Date() },
				{ id: 30, descricao: "Abordagem para sincronização de bases distribuidas considerando que algumas bases podem ser utilizadas offline", id_area_tcc: 23, codigo_docente: "schreiner.geomar", ativo: true, createdAt: new Date(), updatedAt: new Date() },
				{ id: 31, descricao: "Desenvolvimento de uma linguagem textual para modelagem de BDs no BRModelo; Diferentes estilos de Modelagem no BRModelo WEb", id_area_tcc: 24, codigo_docente: "schreiner.geomar", ativo: true, createdAt: new Date(), updatedAt: new Date() },
				{ id: 32, descricao: "Integração de dados críticos e interoperabilidade", id_area_tcc: 25, codigo_docente: "schreiner.geomar", ativo: true, createdAt: new Date(), updatedAt: new Date() },
				{ id: 33, descricao: "Aprendizado por reforço e aplicações de IA voltadas para jogos", id_area_tcc: 26, codigo_docente: "felipe.grando", ativo: true, createdAt: new Date(), updatedAt: new Date() },
				{ id: 35, descricao: "Aplicações e Estudos de Criptografia Pós-Quântica; Mecanismos híbridos de criptografia", id_area_tcc: 28, codigo_docente: "ricardo.parizotto", ativo: true, createdAt: new Date(), updatedAt: new Date() },
				{ id: 36, descricao: "Sequenciadores in-network; Modelos de Consistência: Strong Eventual e CRDTs", id_area_tcc: 29, codigo_docente: "ricardo.parizotto", ativo: true, createdAt: new Date(), updatedAt: new Date() },
				{ id: 37, descricao: "Offloading de sistemas para dispositivos de redes (p4, eBPF)", id_area_tcc: 30, codigo_docente: "ricardo.parizotto", ativo: true, createdAt: new Date(), updatedAt: new Date() },
			],
			{}
		);
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.bulkDelete("tema_tcc", null, {});
	},
};

