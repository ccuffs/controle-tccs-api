const model = require("@backend/models");
const fs = require("fs");
const pdf = require("pdf-parse");

// Função para retornar todos os dicentes
const retornaTodosDicentes = async (req, res) => {
	try {
		const { ano, semestre, fase } = req.query;

		let whereClause = {};
		let includeOrientacao = false;

		// Se há filtros de orientação, precisamos incluir a tabela Orientacao
		if (ano || semestre || fase) {
			includeOrientacao = true;

			// Constrói a cláusula WHERE para a orientação
			const orientacaoWhere = {};

			if (ano) {
				orientacaoWhere.ano = parseInt(ano);
			}

			if (semestre) {
				orientacaoWhere.semestre = parseInt(semestre);
			}

			if (fase) {
				orientacaoWhere.fase = parseInt(fase);
			}

			// Busca dicentes que possuem orientação com os critérios especificados
			const dicentes = await model.Dicente.findAll({
				include: [
					{
						model: model.Orientacao,
						where: orientacaoWhere,
						required: true, // INNER JOIN - só dicentes com orientação
						attributes: [] // Não retorna dados da orientação, só usa para filtro
					}
				],
				group: ['Dicente.matricula'], // Evita duplicatas se dicente tem múltiplas orientações
				distinct: true
			});

			res.status(200).json({ dicentes: dicentes });
		} else {
			// Se não há filtros, retorna todos os dicentes
			const dicentes = await model.Dicente.findAll();
			res.status(200).json({ dicentes: dicentes });
		}
	} catch (error) {
		console.log("Erro ao buscar dicentes:", error);
		res.sendStatus(500);
	}
};

// Função para criar um novo dicente
const criaDicente = async (req, res) => {
	const formData = req.body.formData;
	try {
		const dicente = model.Dicente.build(formData);
		await dicente.save();
		res.sendStatus(200);
	} catch (error) {
		console.log("Erro ao criar dicente:", error);
		res.sendStatus(500);
	}
};

// Função para atualizar um dicente
const atualizaDicente = async (req, res) => {
	const formData = req.body.formData;
	try {
		await model.Dicente.update(formData, { where: { matricula: formData.matricula } });
		res.sendStatus(200);
	} catch (error) {
		console.log("Erro ao atualizar dicente:", error);
		res.sendStatus(500);
	}
};

// Função para deletar um dicente
const deletaDicente = async (req, res) => {
	try {
		const matricula = req.params.matricula;
		const deleted = await model.Dicente.destroy({
			where: { matricula: matricula },
		});

		if (deleted) {
			res.sendStatus(200);
		} else {
			res.status(404).send({ message: "Dicente não encontrado" });
		}
	} catch (error) {
		console.error("Erro ao deletar dicente:", error);
		res.status(500).send({ message: "Erro ao deletar dicente" });
	}
};

// Função para processar PDF e extrair dados dos dicentes
const processarPDFDicentes = async (caminhoArquivo) => {
	try {
		const dataBuffer = fs.readFileSync(caminhoArquivo);
		const data = await pdf(dataBuffer);

		const texto = data.text;
		const dicentes = [];

		// Divide o texto em linhas para melhor processamento
		const linhas = texto.split('\n').map(linha => linha.trim()).filter(linha => linha.length > 0);

		// Procura por padrões: NOME seguido de números (matrícula) e depois um número simples na próxima linha
		for (let i = 0; i < linhas.length - 1; i++) {
			const linha = linhas[i];
			const proximaLinha = linhas[i + 1];

			// Regex para capturar nome e matrícula na mesma linha
			// Nome (letras, espaços, acentos) seguido de matrícula (números no final)
			const regexNomeMatricula = /^([A-ZÁÀÂÃÉÊÍÓÔÕÚÇ\s]+?)(\d{10,})$/;
			const matchNomeMatricula = linha.match(regexNomeMatricula);

			// Verifica se a próxima linha é apenas um número (ID)
			const regexId = /^\d+$/;
			const matchId = proximaLinha.match(regexId);

			if (matchNomeMatricula && matchId) {
				const [, nome, matricula] = matchNomeMatricula;
				const id = parseInt(proximaLinha);

				dicentes.push({
					matricula: parseInt(matricula),
					nome: nome.trim(),
					email: '' // Email vazio por padrão, pois não está no PDF
				});
			}
		}

		return dicentes;
	} catch (error) {
		console.error("Erro ao processar PDF:", error);
		throw error;
	}
};

// Função para inserir múltiplos dicentes de uma vez
const inserirMultiplosDicentes = async (dicentes) => {
	try {
		const resultados = {
			sucessos: 0,
			erros: 0,
			detalhes: []
		};

		for (const dicenteData of dicentes) {
			try {
								// Verifica se o dicente já existe
				const dicenteExistente = await model.Dicente.findByPk(dicenteData.matricula);

				if (dicenteExistente) {
					resultados.detalhes.push({
						matricula: dicenteData.matricula,
						nome: dicenteData.nome,
						status: 'já_existe'
					});
					continue;
				}

				// Cria o novo dicente
				await model.Dicente.create(dicenteData);
				resultados.sucessos++;
				resultados.detalhes.push({
					matricula: dicenteData.matricula,
					nome: dicenteData.nome,
					status: 'inserido'
				});

			} catch (error) {
				console.log("Erro ao inserir dicente:", error);
				resultados.erros++;
				resultados.detalhes.push({
					matricula: dicenteData.matricula,
					nome: dicenteData.nome,
					status: 'erro',
					erro: error.message
				});
			}
		}

		return resultados;
	} catch (error) {
		console.error("Erro ao inserir múltiplos dicentes:", error);
		throw error;
	}
};

// Função para inserir múltiplos dicentes e suas orientações de uma vez
const inserirMultiplosDicentesComOrientacao = async (dicentes, orientacaoData) => {
	try {
		const resultados = {
			sucessos: 0,
			erros: 0,
			detalhes: []
		};

		for (const dicenteData of dicentes) {
			try {
				// Verifica se o dicente já existe
				const dicenteExistente = await model.Dicente.findByPk(dicenteData.matricula);

				if (!dicenteExistente) {
					// Cria o novo dicente se não existir
					await model.Dicente.create(dicenteData);
					resultados.detalhes.push({
						matricula: dicenteData.matricula,
						nome: dicenteData.nome,
						status: 'dicente_inserido'
					});
				} else {
					resultados.detalhes.push({
						matricula: dicenteData.matricula,
						nome: dicenteData.nome,
						status: 'dicente_ja_existe'
					});
				}

				// Verifica se a orientação já existe
				const orientacaoExistente = await model.Orientacao.findOne({
					where: {
						ano: orientacaoData.ano,
						semestre: orientacaoData.semestre,
						id_curso: orientacaoData.id_curso,
						fase: orientacaoData.fase,
						matricula: dicenteData.matricula
					}
				});

				if (!orientacaoExistente) {
					// Cria a orientação sem orientador (código = null)
					await model.Orientacao.create({
						ano: orientacaoData.ano,
						semestre: orientacaoData.semestre,
						id_curso: orientacaoData.id_curso,
						fase: orientacaoData.fase,
						matricula: dicenteData.matricula,
						codigo: null // Orientador será definido posteriormente
					});

					// Atualiza o status no detalhe se necessário
					const detalheExistente = resultados.detalhes.find(d => d.matricula === dicenteData.matricula);
					if (detalheExistente) {
						if (detalheExistente.status === 'dicente_inserido') {
							detalheExistente.status = 'dicente_e_orientacao_inseridos';
						} else {
							detalheExistente.status = 'orientacao_inserida';
						}
					}
				} else {
					// Orientação já existe
					const detalheExistente = resultados.detalhes.find(d => d.matricula === dicenteData.matricula);
					if (detalheExistente) {
						if (detalheExistente.status === 'dicente_inserido') {
							detalheExistente.status = 'dicente_inserido_orientacao_ja_existe';
						} else {
							detalheExistente.status = 'orientacao_ja_existe';
						}
					}
				}

				resultados.sucessos++;

			} catch (error) {
				console.log("Erro ao inserir dicente/orientação:", error);
				resultados.erros++;
				resultados.detalhes.push({
					matricula: dicenteData.matricula,
					nome: dicenteData.nome,
					status: 'erro',
					erro: error.message
				});
			}
		}

		return resultados;
	} catch (error) {
		console.error("Erro ao inserir múltiplos dicentes com orientação:", error);
		throw error;
	}
};

// Função para processar PDF e inserir dicentes no banco
const processarEInserirPDFDicentes = async (req, res) => {
	try {
		const caminhoArquivo = req.file?.path;
		const { ano, semestre, fase, id_curso } = req.body;

		if (!caminhoArquivo) {
			return res.status(400).json({
				message: "Nenhum arquivo PDF fornecido"
			});
		}

		if (!ano || !semestre || !fase || !id_curso) {
			return res.status(400).json({
				message: "Parâmetros obrigatórios não fornecidos: ano, semestre, fase e id_curso são necessários"
			});
		}

		// Extrai os dados do PDF
		const dicentes = await processarPDFDicentes(caminhoArquivo);

		if (dicentes.length === 0) {
			return res.status(400).json({
				message: "Nenhum dicente encontrado no PDF"
			});
		}

		// Dados da orientação
		const orientacaoData = {
			ano: parseInt(ano),
			semestre: parseInt(semestre),
			fase: parseInt(fase),
			id_curso: parseInt(id_curso)
		};

		// Insere os dicentes e orientações no banco
		const resultados = await inserirMultiplosDicentesComOrientacao(dicentes, orientacaoData);

		// Remove o arquivo temporário após processamento
		fs.unlinkSync(caminhoArquivo);

		res.status(200).json({
			message: "PDF processado com sucesso",
			totalEncontrados: dicentes.length,
			sucessos: resultados.sucessos,
			erros: resultados.erros,
			detalhes: resultados.detalhes
		});

	} catch (error) {
		console.error("Erro ao processar PDF de dicentes:", error);

		// Remove o arquivo temporário em caso de erro
		if (req.file?.path) {
			try {
				fs.unlinkSync(req.file.path);
			} catch (unlinkError) {
				console.error("Erro ao remover arquivo temporário:", unlinkError);
			}
		}

		res.status(500).json({
			message: "Erro interno do servidor ao processar PDF",
			erro: error.message
		});
	}
};

module.exports = {
	retornaTodosDicentes,
	criaDicente,
	atualizaDicente,
	deletaDicente,
	processarEInserirPDFDicentes,
	processarPDFDicentes,
	inserirMultiplosDicentes,
	inserirMultiplosDicentesComOrientacao
};