const model = require("../models");
const dicenteRepository = require("../repository/dicente-repository");
const fs = require("fs");
const pdf = require("pdf-parse");
const multer = require("multer");
const path = require("path");
const ldap = require("ldapjs");

// Configuração do multer para upload de PDFs
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		const uploadDir = "uploads/temp";
		// Cria o diretório se não existir
		if (!fs.existsSync(uploadDir)) {
			fs.mkdirSync(uploadDir, { recursive: true });
		}
		cb(null, uploadDir);
	},
	filename: function (req, file, cb) {
		// Nome único para o arquivo temporário
		const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
		cb(
			null,
			file.fieldname +
				"-" +
				uniqueSuffix +
				path.extname(file.originalname),
		);
	},
});

const fileFilter = (req, file, cb) => {
	if (file.mimetype === "application/pdf") {
		cb(null, true);
	} else {
		cb(new Error("Apenas arquivos PDF são permitidos!"), false);
	}
};

const upload = multer({
	storage: storage,
	fileFilter: fileFilter,
	limits: {
		fileSize: 10 * 1024 * 1024, // Limite de 10MB
	},
});

// Configuração do LDAP
const ldapConfig = {
	url: process.env.LDAP_URL || "ldap://localhost:389",
	bindDN: process.env.LDAP_BIND_DN || "",
	bindCredentials: process.env.LDAP_BIND_CREDENTIALS || "",
	searchBase: process.env.LDAP_SEARCH_BASE || "dc=example,dc=com",
};

/**
 * Escapa caracteres especiais para filtros LDAP
 * @param {string} str - String para escapar
 * @returns {string} String escapada
 */
function escapeLdapFilter(str) {
	if (!str) return "";
	return str
		.replace(/\\/g, "\\5c")
		.replace(/\(/g, "\\28")
		.replace(/\)/g, "\\29")
		.replace(/\*/g, "\\2a")
		.replace(/\//g, "\\2f")
		.replace(/\0/g, "\\00");
}

/**
 * Busca um usuário no LDAP pelo campo cn (Common Name)
 * @param {string} cn - Nome completo (Common Name) para buscar
 * @returns {Promise<Object|null>} Objeto com uid, mail e uffsEmailAlternativo ou null
 */
async function buscarDadosLdapPorCn(cn) {
	return new Promise((resolve, reject) => {
		const client = ldap.createClient({
			url: ldapConfig.url,
		});

		// Bind (autenticação) no LDAP
		client.bind(ldapConfig.bindDN, ldapConfig.bindCredentials, (err) => {
			if (err) {
				client.unbind();
				return reject(new Error(`Erro ao conectar no LDAP: ${err.message}`));
			}

			// Escapar o nome para o filtro LDAP
			const cnEscaped = escapeLdapFilter(cn);

			// Buscar pelo campo cn
			const searchOptions = {
				filter: `(cn=${cnEscaped})`,
				scope: "sub",
				attributes: ["uid", "cn", "mail", "uffsEmailAlternativo"],
			};

			client.search(ldapConfig.searchBase, searchOptions, (err, res) => {
				if (err) {
					client.unbind();
					return reject(new Error(`Erro na busca LDAP: ${err.message}`));
				}

				let found = false;

				res.on("searchEntry", (entry) => {
					found = true;
					// uid pode ser um array ou string
					const uid = Array.isArray(entry.object.uid)
						? entry.object.uid[0]
						: entry.object.uid;
					// mail pode ser um array ou string
					const mail = Array.isArray(entry.object.mail)
						? entry.object.mail[0]
						: entry.object.mail;
					// uffsEmailAlternativo pode ser um array ou string
					const uffsEmailAlternativo = Array.isArray(
						entry.object.uffsEmailAlternativo,
					)
						? entry.object.uffsEmailAlternativo[0]
						: entry.object.uffsEmailAlternativo;
					client.unbind();
					resolve({
						uid: uid || null,
						mail: mail || null,
						uffsEmailAlternativo: uffsEmailAlternativo || null,
					});
				});

				res.on("error", (err) => {
					client.unbind();
					reject(new Error(`Erro na busca LDAP: ${err.message}`));
				});

				res.on("end", (result) => {
					if (!found) {
						client.unbind();
						resolve(null);
					}
				});
			});
		});
	});
}

/**
 * Busca dados no LDAP e cria/atualiza usuário com associações
 * @param {string} nome - Nome do dicente para buscar no LDAP
 * @param {Object} transaction - Transação do Sequelize
 * @param {number} id_curso - ID do curso para associar ao usuário
 * @returns {Promise<Object|null>} Objeto com uid e emailAlternativo ou null
 */
async function buscarLdapECriarUsuario(nome, transaction, id_curso) {
	try {
		// Buscar no LDAP
		const resultadoLdap = await buscarDadosLdapPorCn(nome);

		if (!resultadoLdap || !resultadoLdap.uid) {
			return null;
		}

		const uid = resultadoLdap.uid;
		const mail = resultadoLdap.mail || null;
		const uffsEmailAlternativo = resultadoLdap.uffsEmailAlternativo || null;

		// 1. Criar ou atualizar usuário
		const [usuario, usuarioCriado] = await model.Usuario.findOrCreate({
			where: { id: uid },
			defaults: {
				id: uid,
				nome: nome,
				email: mail,
			},
			transaction,
		});

		// Se o usuário já existia, atualizar nome e email se necessário
		if (!usuarioCriado) {
			const precisaAtualizar =
				usuario.nome !== nome || usuario.email !== mail;
			if (precisaAtualizar) {
				await usuario.update(
					{
						nome: nome,
						email: mail,
					},
					{ transaction },
				);
			}
		}

		// 2. Criar registro em usuario_curso com o id_curso fornecido
		if (id_curso) {
			await model.UsuarioCurso.findOrCreate({
				where: {
					id_usuario: uid,
					id_curso: id_curso,
				},
				defaults: {
					id_usuario: uid,
					id_curso: id_curso,
				},
				transaction,
			});
		}

		// 3. Criar registro em usuario_grupo (id_grupo = 4)
		await model.UsuarioGrupo.findOrCreate({
			where: {
				id_usuario: uid,
				id_grupo: 4,
			},
			defaults: {
				id_usuario: uid,
				id_grupo: 4,
			},
			transaction,
		});

		return {
			uid: uid,
			emailAlternativo: uffsEmailAlternativo,
		};
	} catch (error) {
		console.error("Erro ao buscar LDAP e criar usuário:", error);
		// Retorna null em caso de erro para não bloquear a inserção do dicente
		return null;
	}
}

// Função para retornar todos os dicentes
const retornaTodosDicentes = async (req, res) => {
	try {
		const { ano, semestre, fase, id_curso, etapa } = req.query;

		// Se há filtros de TCC, precisamos incluir a tabela TrabalhoConclusao
		if (ano || semestre || fase || id_curso || etapa) {
			const filtros = { ano, semestre, fase, id_curso, etapa };
			const dicentes =
				await dicenteRepository.obterDicentesComFiltrosTcc(filtros);
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

		const dicente =
			await dicenteRepository.obterDicentePorMatricula(matricula);

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
	const id_usuario = req.usuario.id;
	const permissoesService = require("./permissoes-service");

	try {
		// Verificar se o usuário está editando seus próprios dados
		const dicenteUsuario =
			await dicenteRepository.obterDicentePorUsuario(id_usuario);

		if (
			dicenteUsuario &&
			dicenteUsuario.matricula ===
				parseInt(matricula || formData.matricula)
		) {
			// Dicente editando seus próprios dados - permitir apenas email
			const dadosPermitidos = {
				email: formData.email,
			};

			const sucesso = await dicenteRepository.atualizarDicente(
				matricula || formData.matricula,
				dadosPermitidos,
			);

			if (!sucesso) {
				return res
					.status(404)
					.json({ message: "Dicente não encontrado" });
			}

			return res
				.status(200)
				.json({ message: "Dicente atualizado com sucesso" });
		}

		// Caso contrário, verificar se tem permissão administrativa
		const permissoesUsuario =
			await permissoesService.buscarPermissoesDoUsuario(id_usuario);
		const { Permissoes } = require("../enums/permissoes");

		const temPermissao = permissoesUsuario.some(
			(permissao) => permissao.id === Permissoes.DICENTE.EDITAR,
		);

		if (!temPermissao) {
			return res.status(403).json({
				message:
					"Permissão negada: você só pode editar seus próprios dados",
			});
		}

		// Atualização administrativa completa
		const sucesso = await dicenteRepository.atualizarDicente(
			matricula || formData.matricula,
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
			const transaction = await model.sequelize.transaction();
			try {
				// Verifica se o dicente já existe
				const dicenteExistente = await model.Dicente.findByPk(
					dicenteData.matricula,
					{ transaction },
				);

				let dadosLdap = null;
				let dicenteCriado = false;

				if (!dicenteExistente) {
					// Buscar no LDAP e criar usuário antes de criar o dicente
					dadosLdap = await buscarLdapECriarUsuario(
						dicenteData.nome,
						transaction,
						orientacaoData.id_curso,
					);

					// Preparar dados do dicente com informações do LDAP
					const dadosDicente = {
						...dicenteData,
					};

					// Se encontrou dados no LDAP, atualizar com id_usuario e email alternativo
					if (dadosLdap) {
						dadosDicente.id_usuario = dadosLdap.uid;
						if (dadosLdap.emailAlternativo) {
							dadosDicente.email = dadosLdap.emailAlternativo;
						}
					}

					// Cria o novo dicente se não existir
					await model.Dicente.create(dadosDicente, { transaction });
					dicenteCriado = true;
					resultados.detalhes.push({
						matricula: dicenteData.matricula,
						nome: dicenteData.nome,
						status: dadosLdap
							? "dicente_inserido_com_usuario"
							: "dicente_inserido",
					});
				} else {
					// Se o dicente já existe, tentar buscar no LDAP e atualizar
					if (!dicenteExistente.id_usuario) {
						dadosLdap = await buscarLdapECriarUsuario(
							dicenteData.nome,
							transaction,
							orientacaoData.id_curso,
						);

						if (dadosLdap) {
							const emailAtualizado = dadosLdap.emailAlternativo
								? dadosLdap.emailAlternativo
								: dicenteExistente.email;
							await dicenteExistente.update(
								{
									id_usuario: dadosLdap.uid,
									email: emailAtualizado,
								},
								{ transaction },
							);
						}
					}

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
					transaction,
				});

				let tccId;

				if (!tccExistente) {
					// Cria o trabalho de conclusão primeiro
					const novoTcc = await model.TrabalhoConclusao.create(
						{
						ano: orientacaoData.ano,
						semestre: orientacaoData.semestre,
						id_curso: orientacaoData.id_curso,
						fase: orientacaoData.fase,
						matricula: dicenteData.matricula,
						tema: null, // Será definido posteriormente
						titulo: null, // Será definido posteriormente
						resumo: null, // Será definido posteriormente
						etapa: 0, // Etapa inicial
						},
						{ transaction },
					);

					tccId = novoTcc.id;

					// Atualiza o status no detalhe
					const detalheExistente = resultados.detalhes.find(
						(d) => d.matricula === dicenteData.matricula,
					);
					if (detalheExistente) {
						if (
							detalheExistente.status === "dicente_inserido" ||
							detalheExistente.status === "dicente_inserido_com_usuario"
						) {
							detalheExistente.status = detalheExistente.status.includes(
								"com_usuario",
							)
								? "dicente_e_tcc_inseridos_com_usuario"
								: "dicente_e_tcc_inseridos";
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
						if (
							detalheExistente.status === "dicente_inserido" ||
							detalheExistente.status === "dicente_inserido_com_usuario"
						) {
							detalheExistente.status = detalheExistente.status.includes(
								"com_usuario",
							)
								? "dicente_inserido_tcc_ja_existe_com_usuario"
								: "dicente_inserido_tcc_ja_existe";
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
						transaction,
					});

					if (!orientacaoExistente) {
						// Verifica se já existe um orientador principal para este TCC
						const orientadorPrincipalExistente =
							await model.Orientacao.findOne({
								where: {
									id_tcc: tccId,
									orientador: true,
								},
								transaction,
							});

						const isOrientadorPrincipal =
							orientacaoData.orientador ||
							!orientadorPrincipalExistente;

						await model.Orientacao.create(
							{
							id: null, // Auto-increment
							codigo_docente: orientacaoData.codigo_docente,
							id_tcc: tccId,
							orientador: isOrientadorPrincipal,
							},
							{ transaction },
						);

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

				// Commit da transação
				await transaction.commit();
				resultados.sucessos++;
			} catch (error) {
				// Rollback da transação em caso de erro
				await transaction.rollback();
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
		// Se vier de /meu-perfil, usa o id do usuário logado
		const id_usuario = req.params.id_usuario || req.usuario.id;

		const dicente =
			await dicenteRepository.obterDicentePorUsuario(id_usuario);

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
	upload,
};
