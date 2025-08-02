const model = require("../models");
const dicenteRepository = require("../repository/dicente-repository");
const fs = require("fs");
const pdf = require("pdf-parse");

// Função para retornar todos os dicentes
const retornaTodosDicentes = async (req, res) => {
	try {
		const { ano, semestre, fase, id_curso, etapa } = req.query;

		// Se há filtros de TCC, precisamos incluir a tabela TrabalhoConclusao
		if (ano || semestre || fase || id_curso || etapa) {
			const filtros = { ano, semestre, fase, id_curso, etapa };
			const dicentes = await dicenteRepository.obterDicentesComFiltrosTcc(
				filtros,
			);
			res.status(200).json({ dicentes: dicentes });
		} else {
			// Se não há filtros, retorna todos os dicentes
			const dicentes = await dicenteRepository.obterTodosDicentes();
			res.status(200).json({ dicentes: dicentes });
		}
	} catch (error) {
		console.log("Erro ao buscar dicentes:", error);
		res.sendStatus(500);
	}
};

// Função para buscar dicente específico por matrícula
const retornaDicentePorMatricula = async (req, res) => {
	try {
		const { matricula } = req.params;

		const dicente = await dicenteRepository.obterDicentePorMatricula(
			matricula,
		);

		if (!dicente) {
			return res.status(404).json({ message: "Dicente não encontrado" });
		}

		res.status(200).json({ dicente: dicente });
	} catch (error) {
		console.log("Erro ao buscar dicente:", error);
		res.sendStatus(500);
	}
};

// Função para criar um novo dicente
const criaDicente = async (req, res) => {
	const formData = req.body.formData;
	try {
		// Verificar se já existe dicente com esta matrícula
		const dicenteExiste = await dicenteRepository.verificarDicenteExiste(
			formData.matricula,
		);

		if (dicenteExiste) {
			return res.status(400).json({
				message: "Já existe um dicente com esta matrícula",
			});
		}

		const dicente = await dicenteRepository.criarDicente(formData);

		res.status(201).json({
			message: "Dicente criado com sucesso",
		});
	} catch (error) {
		console.log("Erro ao criar dicente:", error);
		console.log("Dados que causaram erro:", formData);
		res.status(500).json({ error: error.message });
	}
};

// Função para atualizar um dicente
const atualizaDicente = async (req, res) => {
	const { matricula } = req.params;
	const formData = req.body.formData;

	try {
		const sucesso = await dicenteRepository.atualizarDicente(
			matricula,
			formData,
		);

		if (!sucesso) {
			return res.status(404).json({ message: "Dicente não encontrado" });
		}

		res.status(200).json({ message: "Dicente atualizado com sucesso" });
	} catch (error) {
		console.log("Erro ao atualizar dicente:", error);
		console.log("Dados que causaram erro:", formData);
		res.status(500).json({ error: error.message });
	}
};

// Função para deletar um dicente
const deletaDicente = async (req, res) => {
	try {
		const matricula = req.params.matricula;
		const sucesso = await dicenteRepository.deletarDicente(matricula);

		if (sucesso) {
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
		const linhas = texto
			.split("\n")
			.map((linha) => linha.trim())
			.filter((linha) => linha.length > 0);

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
					email: "", // Email vazio por padrão, pois não está no PDF
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
			detalhes: [],
		};

		for (const dicenteData of dicentes) {
			try {
				// Verifica se o dicente já existe
				const dicenteExistente = await model.Dicente.findByPk(
					dicenteData.matricula,
				);

				if (dicenteExistente) {
					resultados.detalhes.push({
						matricula: dicenteData.matricula,
						nome: dicenteData.nome,
						status: "já_existe",
					});
					continue;
				}

				// Cria o novo dicente
				await model.Dicente.create(dicenteData);
				resultados.sucessos++;
				resultados.detalhes.push({
					matricula: dicenteData.matricula,
					nome: dicenteData.nome,
					status: "inserido",
				});
			} catch (error) {
				console.log("Erro ao inserir dicente:", error);
				resultados.erros++;
				resultados.detalhes.push({
					matricula: dicenteData.matricula,
					nome: dicenteData.nome,
					status: "erro",
					erro: error.message,
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
const inserirMultiplosDicentesComOrientacao = async (
	dicentes,
	orientacaoData,
) => {
	try {
		const resultados = {
			sucessos: 0,
			erros: 0,
			detalhes: [],
		};

		for (const dicenteData of dicentes) {
			try {
				// Verifica se o dicente já existe
				const dicenteExistente = await model.Dicente.findByPk(
					dicenteData.matricula,
				);

				if (!dicenteExistente) {
					// Cria o novo dicente se não existir
					await model.Dicente.create(dicenteData);
					resultados.detalhes.push({
						matricula: dicenteData.matricula,
						nome: dicenteData.nome,
						status: "dicente_inserido",
					});
				} else {
					resultados.detalhes.push({
						matricula: dicenteData.matricula,
						nome: dicenteData.nome,
						status: "dicente_ja_existe",
					});
				}

				// Verifica se já existe trabalho de conclusão para esta matrícula na mesma oferta
				const tccExistente = await model.TrabalhoConclusao.findOne({
					where: {
						ano: orientacaoData.ano,
						semestre: orientacaoData.semestre,
						id_curso: orientacaoData.id_curso,
						fase: orientacaoData.fase,
						matricula: dicenteData.matricula,
					},
				});

				let tccId;

				if (!tccExistente) {
					// Cria o trabalho de conclusão primeiro
					const novoTcc = await model.TrabalhoConclusao.create({
						ano: orientacaoData.ano,
						semestre: orientacaoData.semestre,
						id_curso: orientacaoData.id_curso,
						fase: orientacaoData.fase,
						matricula: dicenteData.matricula,
						tema: null, // Será definido posteriormente
						titulo: null, // Será definido posteriormente
						resumo: null, // Será definido posteriormente
						etapa: 0, // Etapa inicial
					});

					tccId = novoTcc.id;

					// Atualiza o status no detalhe
					const detalheExistente = resultados.detalhes.find(
						(d) => d.matricula === dicenteData.matricula,
					);
					if (detalheExistente) {
						if (detalheExistente.status === "dicente_inserido") {
							detalheExistente.status = "dicente_e_tcc_inseridos";
						} else {
							detalheExistente.status = "tcc_inserido";
						}
					}
				} else {
					tccId = tccExistente.id;

					// TCC já existe
					const detalheExistente = resultados.detalhes.find(
						(d) => d.matricula === dicenteData.matricula,
					);
					if (detalheExistente) {
						if (detalheExistente.status === "dicente_inserido") {
							detalheExistente.status =
								"dicente_inserido_tcc_ja_existe";
						} else {
							detalheExistente.status = "tcc_ja_existe";
						}
					}
				}

				// Agora cria a orientação vinculada ao TCC (se especificado orientador)
				if (orientacaoData.codigo_docente) {
					// Verifica se já existe orientação deste docente para este TCC
					const orientacaoExistente = await model.Orientacao.findOne({
						where: {
							codigo_docente: orientacaoData.codigo_docente,
							id_tcc: tccId,
						},
					});

					if (!orientacaoExistente) {
						// Verifica se já existe um orientador principal para este TCC
						const orientadorPrincipalExistente =
							await model.Orientacao.findOne({
								where: {
									id_tcc: tccId,
									orientador: true,
								},
							});

						const isOrientadorPrincipal =
							orientacaoData.orientador ||
							!orientadorPrincipalExistente;

						await model.Orientacao.create({
							id: null, // Auto-increment
							codigo_docente: orientacaoData.codigo_docente,
							id_tcc: tccId,
							orientador: isOrientadorPrincipal,
						});

						// Atualiza o status no detalhe
						const detalheExistente = resultados.detalhes.find(
							(d) => d.matricula === dicenteData.matricula,
						);
						if (detalheExistente) {
							if (
								detalheExistente.status.includes("tcc_inserido")
							) {
								detalheExistente.status =
									detalheExistente.status.replace(
										"tcc_inserido",
										"tcc_e_orientacao_inseridos",
									);
							} else if (
								detalheExistente.status.includes(
									"tcc_ja_existe",
								)
							) {
								detalheExistente.status =
									detalheExistente.status.replace(
										"tcc_ja_existe",
										"tcc_existe_orientacao_inserida",
									);
							} else {
								detalheExistente.status +=
									"_orientacao_inserida";
							}
						}
					} else {
						// Orientação já existe
						const detalheExistente = resultados.detalhes.find(
							(d) => d.matricula === dicenteData.matricula,
						);
						if (
							detalheExistente &&
							!detalheExistente.status.includes(
								"orientacao_ja_existe",
							)
						) {
							detalheExistente.status += "_orientacao_ja_existe";
						}
					}
				}

				resultados.sucessos++;
			} catch (error) {
				console.log("Erro ao inserir dicente/tcc/orientação:", error);
				resultados.erros++;
				resultados.detalhes.push({
					matricula: dicenteData.matricula,
					nome: dicenteData.nome,
					status: "erro",
					erro: error.message,
				});
			}
		}

		return resultados;
	} catch (error) {
		console.error(
			"Erro ao inserir múltiplos dicentes com orientação:",
			error,
		);
		throw error;
	}
};

// Função para processar PDF e inserir dicentes no banco
const processarEInserirPDFDicentes = async (req, res) => {
	try {
		const caminhoArquivo = req.file?.path;
		const { ano, semestre, fase, id_curso, codigo_docente, orientador } =
			req.body;

		if (!caminhoArquivo) {
			return res.status(400).json({
				message: "Nenhum arquivo PDF fornecido",
			});
		}

		if (!ano || !semestre || !fase || !id_curso) {
			return res.status(400).json({
				message:
					"Parâmetros obrigatórios não fornecidos: ano, semestre, fase e id_curso são necessários",
			});
		}

		// Extrai os dados do PDF
		const dicentes = await processarPDFDicentes(caminhoArquivo);

		if (dicentes.length === 0) {
			return res.status(400).json({
				message: "Nenhum dicente encontrado no PDF",
			});
		}

		// Dados da orientação
		const orientacaoData = {
			ano: parseInt(ano),
			semestre: parseInt(semestre),
			fase: parseInt(fase),
			id_curso: parseInt(id_curso),
		};

		// Se código do docente for fornecido, incluir nas orientações
		if (codigo_docente) {
			orientacaoData.codigo_docente = codigo_docente;
			orientacaoData.orientador =
				orientador === "true" || orientador === true || false;
		}

		// Insere os dicentes, TCCs e orientações (se aplicável) no banco
		const resultados = await inserirMultiplosDicentesComOrientacao(
			dicentes,
			orientacaoData,
		);

		// Remove o arquivo temporário após processamento
		fs.unlinkSync(caminhoArquivo);

		res.status(200).json({
			message: "PDF processado com sucesso",
			totalEncontrados: dicentes.length,
			sucessos: resultados.sucessos,
			erros: resultados.erros,
			detalhes: resultados.detalhes,
			orientacoesIncluidas: !!codigo_docente,
		});
	} catch (error) {
		console.error("Erro ao processar PDF de dicentes:", error);

		// Remove o arquivo temporário em caso de erro
		if (req.file?.path) {
			try {
				fs.unlinkSync(req.file.path);
			} catch (unlinkError) {
				console.error(
					"Erro ao remover arquivo temporário:",
					unlinkError,
				);
			}
		}

		res.status(500).json({
			message: "Erro interno do servidor ao processar PDF",
			erro: error.message,
		});
	}
};

// Função para buscar dicente por id_usuario
const retornaDicentePorUsuario = async (req, res) => {
	try {
		const { id_usuario } = req.params;

		const dicente = await dicenteRepository.obterDicentePorUsuario(id_usuario);

		if (!dicente) {
			return res.status(404).json({ message: "Dicente não encontrado" });
		}

		res.status(200).json(dicente);
	} catch (error) {
		console.log("Erro ao buscar dicente por usuário:", error);
		res.status(500).json({ message: "Erro interno do servidor" });
	}
};

module.exports = {
	retornaTodosDicentes,
	retornaDicentePorMatricula,
	retornaDicentePorUsuario,
	criaDicente,
	atualizaDicente,
	deletaDicente,
	processarEInserirPDFDicentes,
	processarPDFDicentes,
	inserirMultiplosDicentes,
	inserirMultiplosDicentesComOrientacao,
};
