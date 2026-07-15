import { HttpException, Injectable } from "@nestjs/common";
import { InjectConnection, InjectModel } from "@nestjs/sequelize";
import { Sequelize } from "sequelize";
import { DicenteEntity, OrientacaoEntity, TrabalhoConclusaoEntity } from "../database/entities";
import { Permissoes } from "../permissoes/permissoes.enum";
import { PermissoesService } from "../permissoes/permissoes.service";
import { AtualizarDicenteDto } from "./dto/atualizar-dicente.dto";
import { CriarDicenteDto } from "./dto/criar-dicente.dto";
import { DicentesRepository, FiltrosTcc } from "./dicentes.repository";
import { DicenteExtraidoPdf, PdfDicentesService } from "./pdf-dicentes.service";
import { LdapDicentesService } from "./ldap-dicentes.service";

export interface OrientacaoDataPdf {
	ano: number;
	semestre: number;
	fase: number;
	id_curso: number;
	codigo_docente?: string;
	orientador?: boolean;
}

export interface ResultadoInsercaoDetalhe {
	matricula: number;
	nome: string;
	status: string;
	erro?: string;
}

export interface ResultadoInsercao {
	sucessos: number;
	erros: number;
	detalhes: ResultadoInsercaoDetalhe[];
}

@Injectable()
export class DicentesService {
	constructor(
		private readonly dicentesRepository: DicentesRepository,
		private readonly permissoesService: PermissoesService,
		private readonly pdfDicentesService: PdfDicentesService,
		private readonly ldapDicentesService: LdapDicentesService,
		@InjectConnection() private readonly sequelize: Sequelize,
		@InjectModel(DicenteEntity)
		private readonly dicenteModel: typeof DicenteEntity,
		@InjectModel(TrabalhoConclusaoEntity)
		private readonly trabalhoConclusaoModel: typeof TrabalhoConclusaoEntity,
		@InjectModel(OrientacaoEntity)
		private readonly orientacaoModel: typeof OrientacaoEntity,
	) {}

	obterTodosDicentes(filtros: FiltrosTcc): Promise<DicenteEntity[]> {
		const { ano, semestre, fase, id_curso, etapa } = filtros;
		if (ano || semestre || fase || id_curso || etapa) {
			return this.dicentesRepository.obterDicentesComFiltrosTcc(filtros);
		}
		return this.dicentesRepository.obterTodosDicentes();
	}

	obterDicentePorMatricula(matricula: string): Promise<DicenteEntity | null> {
		return this.dicentesRepository.obterDicentePorMatricula(matricula);
	}

	obterDicentePorUsuario(idUsuario: string): Promise<DicenteEntity | null> {
		return this.dicentesRepository.obterDicentePorUsuario(idUsuario);
	}

	async criarDicente(dados: CriarDicenteDto): Promise<void> {
		const dicenteExiste = await this.dicentesRepository.verificarDicenteExiste(dados.matricula);

		if (dicenteExiste) {
			throw new HttpException({ message: "Já existe um dicente com esta matrícula" }, 400);
		}

		await this.dicentesRepository.criarDicente(dados);
	}

	/** Porta de `atualizaDicente`: dicente editando os próprios dados só pode alterar o email. */
	async atualizarDicente(
		idUsuarioAutenticado: string,
		matriculaParam: string | undefined,
		formData: AtualizarDicenteDto,
	): Promise<void> {
		const matricula = matriculaParam || formData.matricula;
		if (!matricula) {
			throw new HttpException({ message: "Dicente não encontrado" }, 404);
		}

		const dicenteUsuario = await this.dicentesRepository.obterDicentePorUsuario(idUsuarioAutenticado);

		if (dicenteUsuario && String(dicenteUsuario.matricula) === String(parseInt(matricula, 10))) {
			const dadosPermitidos = { email: formData.email };
			const sucesso = await this.dicentesRepository.atualizarDicente(matricula, dadosPermitidos);

			if (!sucesso) {
				throw new HttpException({ message: "Dicente não encontrado" }, 404);
			}
			return;
		}

		const permissoesUsuario = await this.permissoesService.buscarPermissoesDoUsuario(idUsuarioAutenticado);
		const temPermissao = permissoesUsuario.some((permissao) => permissao.id === Permissoes.DICENTE.EDITAR);

		if (!temPermissao) {
			throw new HttpException(
				{ message: "Permissão negada: você só pode editar seus próprios dados" },
				403,
			);
		}

		const sucesso = await this.dicentesRepository.atualizarDicente(matricula, formData);
		if (!sucesso) {
			throw new HttpException({ message: "Dicente não encontrado" }, 404);
		}
	}

	deletarDicente(matricula: string): Promise<boolean> {
		return this.dicentesRepository.deletarDicente(matricula);
	}

	processarPDFDicentes(caminhoArquivo: string): Promise<DicenteExtraidoPdf[]> {
		return this.pdfDicentesService.processarPDFDicentes(caminhoArquivo);
	}

	/** Porta fiel de `inserirMultiplosDicentesComOrientacao` (dicente-service.js): uma
	 * transação por dicente, cria dicente (com lookup LDAP)/TCC/orientação se necessário. */
	async inserirMultiplosDicentesComOrientacao(
		dicentes: DicenteExtraidoPdf[],
		orientacaoData: OrientacaoDataPdf,
	): Promise<ResultadoInsercao> {
		const resultados: ResultadoInsercao = { sucessos: 0, erros: 0, detalhes: [] };

		for (const dicenteData of dicentes) {
			const transaction = await this.sequelize.transaction();
			try {
				const dicenteExistente = await this.dicenteModel.findByPk(String(dicenteData.matricula), {
					transaction,
				});

				let dadosLdap = null;

				if (!dicenteExistente) {
					dadosLdap = await this.ldapDicentesService.buscarLdapECriarUsuario(
						dicenteData.nome,
						transaction,
						orientacaoData.id_curso,
					);

					const dadosDicente: Record<string, unknown> = { ...dicenteData };

					if (dadosLdap) {
						dadosDicente.id_usuario = dadosLdap.uid;
						if (dadosLdap.emailAlternativo) {
							dadosDicente.email = dadosLdap.emailAlternativo;
						}
					}

					await this.dicenteModel.create(dadosDicente as Partial<DicenteEntity>, { transaction });
					resultados.detalhes.push({
						matricula: dicenteData.matricula,
						nome: dicenteData.nome,
						status: dadosLdap ? "dicente_inserido_com_usuario" : "dicente_inserido",
					});
				} else {
					const existenteIdUsuario = dicenteExistente.get("id_usuario");
					if (!existenteIdUsuario) {
						dadosLdap = await this.ldapDicentesService.buscarLdapECriarUsuario(
							dicenteData.nome,
							transaction,
							orientacaoData.id_curso,
						);

						if (dadosLdap) {
							const emailAtualizado = dadosLdap.emailAlternativo || dicenteExistente.get("email");
							await dicenteExistente.update(
								{ id_usuario: dadosLdap.uid, email: emailAtualizado },
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

				const tccExistente = await this.trabalhoConclusaoModel.findOne({
					where: {
						ano: orientacaoData.ano,
						semestre: orientacaoData.semestre,
						id_curso: orientacaoData.id_curso,
						fase: orientacaoData.fase,
						matricula: dicenteData.matricula,
					},
					transaction,
				});

				let tccId: number;
				const detalheExistente = resultados.detalhes.find((d) => d.matricula === dicenteData.matricula)!;

				if (!tccExistente) {
					const novoTcc = await this.trabalhoConclusaoModel.create(
						{
							ano: orientacaoData.ano,
							semestre: orientacaoData.semestre,
							id_curso: orientacaoData.id_curso,
							fase: orientacaoData.fase,
							matricula: String(dicenteData.matricula),
							tema: null,
							titulo: null,
							resumo: null,
							etapa: 0,
						} as unknown as Partial<TrabalhoConclusaoEntity>,
						{ transaction },
					);
					tccId = novoTcc.id;

					if (detalheExistente.status === "dicente_inserido" || detalheExistente.status === "dicente_inserido_com_usuario") {
						detalheExistente.status = detalheExistente.status.includes("com_usuario")
							? "dicente_e_tcc_inseridos_com_usuario"
							: "dicente_e_tcc_inseridos";
					} else {
						detalheExistente.status = "tcc_inserido";
					}
				} else {
					tccId = tccExistente.id;

					if (detalheExistente.status === "dicente_inserido" || detalheExistente.status === "dicente_inserido_com_usuario") {
						detalheExistente.status = detalheExistente.status.includes("com_usuario")
							? "dicente_inserido_tcc_ja_existe_com_usuario"
							: "dicente_inserido_tcc_ja_existe";
					} else {
						detalheExistente.status = "tcc_ja_existe";
					}
				}

				if (orientacaoData.codigo_docente) {
					const orientacaoExistente = await this.orientacaoModel.findOne({
						where: { codigo_docente: orientacaoData.codigo_docente, id_tcc: tccId },
						transaction,
					});

					if (!orientacaoExistente) {
						const orientadorPrincipalExistente = await this.orientacaoModel.findOne({
							where: { id_tcc: tccId, orientador: true },
							transaction,
						});

						const isOrientadorPrincipal = orientacaoData.orientador || !orientadorPrincipalExistente;

						await this.orientacaoModel.create(
							{
								codigo_docente: orientacaoData.codigo_docente,
								id_tcc: tccId,
								orientador: isOrientadorPrincipal,
							} as Partial<OrientacaoEntity>,
							{ transaction },
						);

						if (detalheExistente.status.includes("tcc_inserido")) {
							detalheExistente.status = detalheExistente.status.replace(
								"tcc_inserido",
								"tcc_e_orientacao_inseridos",
							);
						} else if (detalheExistente.status.includes("tcc_ja_existe")) {
							detalheExistente.status = detalheExistente.status.replace(
								"tcc_ja_existe",
								"tcc_existe_orientacao_inserida",
							);
						} else {
							detalheExistente.status += "_orientacao_inserida";
						}
					} else if (!detalheExistente.status.includes("orientacao_ja_existe")) {
						detalheExistente.status += "_orientacao_ja_existe";
					}
				}

				await transaction.commit();
				resultados.sucessos++;
			} catch (error) {
				await transaction.rollback();
				resultados.erros++;
				resultados.detalhes.push({
					matricula: dicenteData.matricula,
					nome: dicenteData.nome,
					status: "erro",
					erro: (error as Error).message,
				});
			}
		}

		return resultados;
	}
}
