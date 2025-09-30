const model = require("../models");

const declaracoesRepository = {};

// Buscar trabalhos onde o docente foi orientador ou membro de banca
declaracoesRepository.buscarDeclaracoes = async (idUsuario, filtros = {}) => {
	const { ano, semestre, id_curso, fase } = filtros;

	// Construir filtros para trabalhos
	const filtrosTrabalho = {};
	if (ano) filtrosTrabalho.ano = parseInt(ano);
	if (semestre) filtrosTrabalho.semestre = parseInt(semestre);
	if (id_curso) filtrosTrabalho.id_curso = parseInt(id_curso);
	if (fase) filtrosTrabalho.fase = parseInt(fase);

	// Buscar orientações
	const orientacoes = await model.Orientacao.findAll({
		include: [
			{
				model: model.TrabalhoConclusao,
				required: true,
				where: filtrosTrabalho,
				include: [
					{
						model: model.Dicente,
						required: true,
						attributes: ['nome']
					}
				]
			},
			{
				model: model.Docente,
				required: true,
				attributes: ['codigo', 'email', 'nome', 'sala', 'siape', 'id_usuario'],
				where: {
					id_usuario: idUsuario
				}
			}
		],
		where: {
			orientador: true
		}
	});

	// Buscar convites de banca aceitos
	const bancas = await model.Convite.findAll({
		include: [
			{
				model: model.TrabalhoConclusao,
				required: true,
				where: filtrosTrabalho,
				include: [
					{
						model: model.Dicente,
						required: true,
						attributes: ['nome']
					}
				]
			},
			{
				model: model.Docente,
				required: true,
				attributes: ['codigo', 'email', 'nome', 'sala', 'siape', 'id_usuario'],
				where: {
					id_usuario: idUsuario
				}
			}
		],
		where: {
			aceito: true,
			orientacao: false
		}
	});

	// Processar orientações
	const declaracoesOrientacao = orientacoes.map(orientacao => ({
		id_tcc: orientacao.TrabalhoConclusao.id,
		ano: orientacao.TrabalhoConclusao.ano,
		semestre: orientacao.TrabalhoConclusao.semestre,
		fase: orientacao.TrabalhoConclusao.fase,
		titulo_tcc: orientacao.TrabalhoConclusao.titulo || 'Sem título',
		matricula: orientacao.TrabalhoConclusao.matricula,
		nome_dicente: orientacao.TrabalhoConclusao.Dicente.nome,
		nome_docente: orientacao.Docente.nome,
		siape_docente: orientacao.Docente.siape,
		foi_orientador: true,
		tipo_participacao: 'orientacao'
	}));

	// Processar bancas
	const declaracoesBanca = bancas.map(convite => ({
		id_tcc: convite.TrabalhoConclusao.id,
		ano: convite.TrabalhoConclusao.ano,
		semestre: convite.TrabalhoConclusao.semestre,
		fase: convite.TrabalhoConclusao.fase,
		titulo_tcc: convite.TrabalhoConclusao.titulo || 'Sem título',
		matricula: convite.TrabalhoConclusao.matricula,
		nome_dicente: convite.TrabalhoConclusao.Dicente.nome,
		nome_docente: convite.Docente.nome,
		siape_docente: convite.Docente.siape,
		foi_orientador: false,
		tipo_participacao: 'banca'
	}));

	// Combinar e remover duplicatas
	const declaracoes = [...declaracoesOrientacao, ...declaracoesBanca];
	const declaracoesUnicas = [];
	const chaves = new Set();

	for (const decl of declaracoes) {
		const chave = `${decl.id_tcc}_${decl.tipo_participacao}`;
		if (!chaves.has(chave)) {
			chaves.add(chave);
			declaracoesUnicas.push(decl);
		}
	}

	return declaracoesUnicas;
};

// Buscar anos disponíveis para o docente
declaracoesRepository.buscarAnosDisponiveis = async (idUsuario) => {
	// Buscar orientações
	const orientacoes = await model.Orientacao.findAll({
		include: [
			{
				model: model.TrabalhoConclusao,
				required: true,
				attributes: ['ano']
			},
			{
				model: model.Docente,
				required: true,
				attributes: ['codigo', 'email', 'nome', 'sala', 'siape', 'id_usuario'],
				where: {
					id_usuario: idUsuario
				}
			}
		],
		where: {
			orientador: true
		}
	});

	// Buscar convites de banca aceitos
	const bancas = await model.Convite.findAll({
		include: [
			{
				model: model.TrabalhoConclusao,
				required: true,
				attributes: ['ano']
			},
			{
				model: model.Docente,
				required: true,
				attributes: ['codigo', 'email', 'nome', 'sala', 'siape', 'id_usuario'],
				where: {
					id_usuario: idUsuario
				}
			}
		],
		where: {
			aceito: true,
			orientacao: false
		}
	});

	// Extrair anos únicos
	const anosSet = new Set();

	orientacoes.forEach(orientacao => {
		if (orientacao.TrabalhoConclusao.ano) {
			anosSet.add(orientacao.TrabalhoConclusao.ano);
		}
	});

	bancas.forEach(convite => {
		if (convite.TrabalhoConclusao.ano) {
			anosSet.add(convite.TrabalhoConclusao.ano);
		}
	});

	return Array.from(anosSet).sort((a, b) => b - a); // Ordenar decrescente
};

// Buscar semestres disponíveis para o docente
declaracoesRepository.buscarSemestresDisponiveis = async (idUsuario) => {
	// Buscar orientações
	const orientacoes = await model.Orientacao.findAll({
		include: [
			{
				model: model.TrabalhoConclusao,
				required: true,
				attributes: ['semestre']
			},
			{
				model: model.Docente,
				required: true,
				attributes: ['codigo', 'email', 'nome', 'sala', 'siape', 'id_usuario'],
				where: {
					id_usuario: idUsuario
				}
			}
		],
		where: {
			orientador: true
		}
	});

	// Buscar convites de banca aceitos
	const bancas = await model.Convite.findAll({
		include: [
			{
				model: model.TrabalhoConclusao,
				required: true,
				attributes: ['semestre']
			},
			{
				model: model.Docente,
				required: true,
				attributes: ['codigo', 'email', 'nome', 'sala', 'siape', 'id_usuario'],
				where: {
					id_usuario: idUsuario
				}
			}
		],
		where: {
			aceito: true,
			orientacao: false
		}
	});

	// Extrair semestres únicos
	const semestresSet = new Set();

	orientacoes.forEach(orientacao => {
		if (orientacao.TrabalhoConclusao.semestre) {
			semestresSet.add(orientacao.TrabalhoConclusao.semestre);
		}
	});

	bancas.forEach(convite => {
		if (convite.TrabalhoConclusao.semestre) {
			semestresSet.add(convite.TrabalhoConclusao.semestre);
		}
	});

	return Array.from(semestresSet).sort((a, b) => a - b); // Ordenar crescente
};

// Buscar dados completos para gerar uma declaração específica
declaracoesRepository.buscarDadosDeclaracao = async (idUsuario, idTcc, tipoParticipacao) => {
	try {
		let dadosDeclaracao = null;

		if (tipoParticipacao === 'orientacao') {
			// Buscar orientação
			const orientacao = await model.Orientacao.findOne({
				include: [
					{
						model: model.TrabalhoConclusao,
						required: true,
						where: { id: idTcc },
						include: [
							{
								model: model.Dicente,
								required: true,
								attributes: ['nome']
							},
							{
								model: model.Curso,
								required: true,
								attributes: ['id', 'nome'],
								include: [
									{
										model: model.Docente,
										as: 'coordenadorDocente',
										required: true,
										attributes: ['nome', 'siape']
									}
								]
							}
						]
					},
					{
						model: model.Docente,
						required: true,
						attributes: ['nome', 'siape'],
						where: {
							id_usuario: idUsuario
						}
					}
				],
				where: {
					orientador: true
				}
			});

			if (orientacao) {
				dadosDeclaracao = {
					id_tcc: orientacao.TrabalhoConclusao.id,
					ano: orientacao.TrabalhoConclusao.ano,
					semestre: orientacao.TrabalhoConclusao.semestre,
					fase: orientacao.TrabalhoConclusao.fase,
					titulo_tcc: orientacao.TrabalhoConclusao.titulo || 'Sem título',
					nome_dicente: orientacao.TrabalhoConclusao.Dicente.nome,
					nome_docente: orientacao.Docente.nome,
					siape_docente: orientacao.Docente.siape,
					nome_curso: orientacao.TrabalhoConclusao.Curso.nome,
					nome_coordenador: orientacao.TrabalhoConclusao.Curso.coordenadorDocente.nome,
					siape_coordenador: orientacao.TrabalhoConclusao.Curso.coordenadorDocente.siape,
					tipo_participacao: 'orientacao',
					foi_orientador: true
				};
			}
		} else if (tipoParticipacao === 'banca') {
			// Buscar convite de banca
			const convite = await model.Convite.findOne({
				include: [
					{
						model: model.TrabalhoConclusao,
						required: true,
						where: { id: idTcc },
						include: [
							{
								model: model.Dicente,
								required: true,
								attributes: ['nome']
							},
							{
								model: model.Curso,
								required: true,
								attributes: ['id', 'nome'],
								include: [
									{
										model: model.Docente,
										as: 'coordenadorDocente',
										required: true,
										attributes: ['nome', 'siape']
									}
								]
							}
						]
					},
					{
						model: model.Docente,
						required: true,
						attributes: ['nome', 'siape', 'codigo'],
						where: {
							id_usuario: idUsuario
						}
					}
				],
				where: {
					aceito: true,
					orientacao: false
				}
			});

			if (convite) {
				// Buscar dados da defesa
				const defesa = await model.Defesa.findOne({
					where: {
						id_tcc: idTcc,
						membro_banca: convite.Docente.codigo,
						fase: convite.TrabalhoConclusao.fase
					},
					attributes: ['data_defesa']
				});

				dadosDeclaracao = {
					id_tcc: convite.TrabalhoConclusao.id,
					ano: convite.TrabalhoConclusao.ano,
					semestre: convite.TrabalhoConclusao.semestre,
					fase: convite.TrabalhoConclusao.fase,
					titulo_tcc: convite.TrabalhoConclusao.titulo || 'Sem título',
					nome_dicente: convite.TrabalhoConclusao.Dicente.nome,
					nome_docente: convite.Docente.nome,
					siape_docente: convite.Docente.siape,
					nome_curso: convite.TrabalhoConclusao.Curso.nome,
					nome_coordenador: convite.TrabalhoConclusao.Curso.coordenadorDocente.nome,
					siape_coordenador: convite.TrabalhoConclusao.Curso.coordenadorDocente.siape,
					tipo_participacao: 'banca',
					foi_orientador: false,
					data_defesa: defesa?.data_defesa
				};
			}
		}

		return dadosDeclaracao;
	} catch (error) {
		console.error('Erro ao buscar dados da declaração:', error);
		throw error;
	}
};

module.exports = declaracoesRepository;
