const model = require("../models");

const certidoesRepository = {};

// Buscar trabalhos onde o docente foi orientador ou membro de banca
certidoesRepository.buscarCertidoes = async (idUsuario, filtros = {}) => {
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
	const certidoesOrientacao = orientacoes.map(orientacao => ({
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
	const certidoesBanca = bancas.map(convite => ({
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
	const certidoes = [...certidoesOrientacao, ...certidoesBanca];
	const certidoesUnicas = [];
	const chaves = new Set();

	for (const cert of certidoes) {
		const chave = `${cert.id_tcc}_${cert.tipo_participacao}`;
		if (!chaves.has(chave)) {
			chaves.add(chave);
			certidoesUnicas.push(cert);
		}
	}

	return certidoesUnicas;
};

// Buscar anos disponíveis para o docente
certidoesRepository.buscarAnosDisponiveis = async (idUsuario) => {
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
certidoesRepository.buscarSemestresDisponiveis = async (idUsuario) => {
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

module.exports = certidoesRepository;
