import { HttpException, Injectable } from "@nestjs/common";
import { InjectConnection } from "@nestjs/sequelize";
import { Sequelize } from "sequelize";
import { ConviteEntity } from "../database/entities";
import { DocentesRepository } from "../docentes/docentes.repository";
import { OrientacoesRepository } from "../orientacoes/orientacoes.repository";
import { TemasTccRepository } from "../temas-tcc/temas-tcc.repository";
import { ConvitesRepository, FiltrosConvites } from "./convites.repository";
import { CriarConviteDto } from "./dto/criar-convite.dto";

@Injectable()
export class ConvitesService {
	constructor(
		private readonly convitesRepository: ConvitesRepository,
		private readonly docentesRepository: DocentesRepository,
		private readonly temasTccRepository: TemasTccRepository,
		private readonly orientacoesRepository: OrientacoesRepository,
		@InjectConnection() private readonly sequelize: Sequelize,
	) {}

	obterTodosConvites(filtros: FiltrosConvites): Promise<ConviteEntity[]> {
		return this.convitesRepository.obterTodosConvites(filtros);
	}

	async criarConvite(formData: CriarConviteDto): Promise<void> {
		const fase = formData.fase === undefined ? 1 : formData.fase;
		const conviteExiste = await this.convitesRepository.verificarConviteExiste(
			formData.id_tcc,
			formData.codigo_docente,
			fase,
		);

		if (conviteExiste) {
			throw new HttpException({ message: "Já existe um convite para este docente neste TCC" }, 400);
		}

		const dadosConvite: Partial<ConviteEntity> = {
			id_tcc: formData.id_tcc,
			codigo_docente: formData.codigo_docente,
			data_envio: new Date(),
			mensagem_envio: formData.mensagem_envio || "Convite para orientação de TCC",
			aceito: formData.orientacao || false,
			mensagem_feedback: formData.mensagem_feedback || "",
			data_feedback: formData.data_feedback || undefined,
			orientacao: formData.orientacao === undefined ? true : formData.orientacao,
			fase,
		};

		await this.convitesRepository.criarConvite(dadosConvite);
	}

	/** Porta de `respondeConvite`: transação única cobrindo update do convite, criação de
	 * orientação (se aceito e for convite de orientação) e decremento de vagas na oferta. */
	async responderConvite(id: number, codigoDocente: string, fase: number, aceito: boolean): Promise<void> {
		const transaction = await this.sequelize.transaction();

		try {
			const updateData = {
				aceito,
				data_feedback: new Date(),
				mensagem_feedback: aceito ? "Convite aceito" : "Convite rejeitado",
			};

			const sucesso = await this.convitesRepository.atualizarConvite(id, codigoDocente, fase, updateData, transaction);

			if (!sucesso) {
				throw new HttpException({ message: "Convite não encontrado" }, 404);
			}

			const conviteInfo = await this.convitesRepository.obterConvitePorIdEDocente(id, codigoDocente, fase);

			if (aceito && conviteInfo && conviteInfo.orientacao === true) {
				const orientacaoExiste = await this.orientacoesRepository.verificarOrientacaoExiste(
					codigoDocente,
					id,
					transaction,
				);

				if (!orientacaoExiste) {
					const orientadorExiste = await this.orientacoesRepository.verificarOrientadorExiste(id, transaction);

					await this.orientacoesRepository.criarOrientacao(
						{ codigo_docente: codigoDocente, id_tcc: id, orientador: !orientadorExiste },
						transaction,
					);
				}

				try {
					const trabalhoConclusao = await this.convitesRepository.obterTrabalhoConclusaoPorId(id);

					if (trabalhoConclusao) {
						const { ano, semestre, id_curso, fase: faseTrabalho } = trabalhoConclusao;
						const docenteOferta = await this.temasTccRepository.buscarOfertaDocente(
							ano,
							semestre,
							String(id_curso),
							codigoDocente,
							faseTrabalho,
						);

						if (docenteOferta && docenteOferta.vagas > 0) {
							await docenteOferta.update({ vagas: docenteOferta.vagas - 1 });
						}
					}
				} catch {
					// Não falha a operação principal se a atualização de vagas falhar (igual ao legado).
				}
			}

			await transaction.commit();
		} catch (error) {
			await transaction.rollback();
			throw error;
		}
	}

	deletarConvite(id: number, codigoDocente: string, fase: number): Promise<boolean> {
		return this.convitesRepository.deletarConvite(id, codigoDocente, fase);
	}

	async obterConvitesDocente(codigo: string): Promise<ConviteEntity[]> {
		const docente = await this.docentesRepository.obterDocentePorUsuario(codigo);

		if (!docente) {
			throw new HttpException({ message: "Docente não encontrado para este usuário" }, 404);
		}

		return this.convitesRepository.obterConvitesDocente(docente.codigo);
	}
}
