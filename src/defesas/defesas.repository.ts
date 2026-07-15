import { Injectable } from "@nestjs/common";
import { InjectConnection, InjectModel } from "@nestjs/sequelize";
import { Sequelize } from "sequelize";
import {
	ConviteEntity,
	CursoEntity,
	DefesaEntity,
	DicenteEntity,
	DocenteDisponibilidadeBancaEntity,
	DocenteEntity,
	OrientacaoEntity,
	TrabalhoConclusaoEntity,
} from "../database/entities";

export interface FiltrosDefesas {
	id_tcc?: string;
	ano?: string;
	semestre?: string;
}

export interface HorariosAdjacentes {
	horaAnterior: string | null;
	horaPosterior: string | null;
}

export interface DadosAgendamento {
	id_tcc: number;
	fase: number;
	data: string;
	hora: string;
	codigo_orientador: string;
	membros_banca: [string, string];
}

export interface DadosGerenciarBanca {
	id_tcc: number;
	fase: number;
	membros_novos: string[];
	membros_existentes: string[];
	convites_banca_existentes?: { codigo_docente: string; aceito: boolean }[];
	orientador_codigo?: string;
	data_hora_defesa?: string | null;
	alteracoes?: { membro_antigo: string; membro_novo: string }[];
}

const includeTccECurso = [
	{
		model: TrabalhoConclusaoEntity,
		include: [
			{ model: DicenteEntity, attributes: ["matricula", "nome", "email"] },
			{ model: CursoEntity, attributes: ["id", "nome", "codigo"] },
		],
	},
	{ model: DocenteEntity, as: "membroBanca", attributes: ["codigo", "nome", "email", "siape"] },
];

@Injectable()
export class DefesasRepository {
	constructor(
		@InjectModel(DefesaEntity)
		private readonly defesaModel: typeof DefesaEntity,
		@InjectModel(TrabalhoConclusaoEntity)
		private readonly trabalhoConclusaoModel: typeof TrabalhoConclusaoEntity,
		@InjectModel(DocenteDisponibilidadeBancaEntity)
		private readonly disponibilidadeModel: typeof DocenteDisponibilidadeBancaEntity,
		@InjectModel(ConviteEntity)
		private readonly conviteModel: typeof ConviteEntity,
		@InjectModel(OrientacaoEntity)
		private readonly orientacaoModel: typeof OrientacaoEntity,
		@InjectConnection() private readonly sequelize: Sequelize,
	) {}

	async obterTodasDefesas(filtros: FiltrosDefesas): Promise<DefesaEntity[]> {
		const { id_tcc, ano, semestre } = filtros;
		const whereClause: Record<string, number> = {};
		const includeWhere: Record<string, number> = {};

		if (id_tcc) whereClause.id_tcc = parseInt(id_tcc, 10);
		if (ano) includeWhere.ano = parseInt(ano, 10);
		if (semestre) includeWhere.semestre = parseInt(semestre, 10);

		return this.defesaModel.findAll({
			where: whereClause,
			include: [
				{
					model: TrabalhoConclusaoEntity,
					where: Object.keys(includeWhere).length > 0 ? includeWhere : undefined,
					include: [
						{ model: DicenteEntity, attributes: ["matricula", "nome", "email"] },
						{ model: CursoEntity, attributes: ["id", "nome", "codigo"] },
					],
				},
				{ model: DocenteEntity, as: "membroBanca", attributes: ["codigo", "nome", "email", "siape"] },
			],
			order: [["data_defesa", "DESC"]],
		});
	}

	async obterDefesasPorTcc(idTcc: number): Promise<DefesaEntity[]> {
		return this.defesaModel.findAll({
			where: { id_tcc: idTcc },
			include: includeTccECurso,
			order: [["membro_banca", "ASC"]],
		});
	}

	async verificarDefesaExiste(idTcc: number, membroBanca: string | null = null): Promise<boolean> {
		const whereClause: Record<string, unknown> = { id_tcc: idTcc };
		if (membroBanca) whereClause.membro_banca = membroBanca;

		const defesa = await this.defesaModel.findOne({ where: whereClause });
		return defesa !== null;
	}

	async criarDefesa(dadosDefesa: Partial<DefesaEntity>): Promise<DefesaEntity> {
		const defesa = this.defesaModel.build(dadosDefesa);
		await defesa.save();
		return defesa;
	}

	async atualizarDefesa(
		idTcc: number,
		membroBanca: string,
		dadosDefesa: Partial<DefesaEntity>,
		fase: number | null = null,
	): Promise<boolean> {
		const whereClause: Record<string, unknown> = { id_tcc: idTcc, membro_banca: membroBanca };
		if (fase !== undefined && fase !== null) whereClause.fase = fase;

		const [linhasAfetadas] = await this.defesaModel.update(dadosDefesa, { where: whereClause });
		return linhasAfetadas > 0;
	}

	async registrarAvaliacaoDefesa(idTcc: number, avaliacao: number): Promise<boolean> {
		const [linhasAfetadas] = await this.defesaModel.update({ avaliacao }, { where: { id_tcc: idTcc } });
		return linhasAfetadas > 0;
	}

	async deletarDefesa(idTcc: number, membroBanca: string, fase: number | null): Promise<boolean> {
		const whereClause: Record<string, unknown> = { id_tcc: idTcc, membro_banca: membroBanca };
		if (fase !== undefined && fase !== null) whereClause.fase = fase;

		const deleted = await this.defesaModel.destroy({ where: whereClause });
		return deleted > 0;
	}

	async deletarDefesaComRestauracao(
		idTcc: number,
		membroBanca: string,
		fase: number,
		calcularHorarios: (hora: string) => HorariosAdjacentes,
	): Promise<{ sucesso: boolean; motivo?: string; disponibilidadesRestauradas?: boolean }> {
		const t = await this.sequelize.transaction();

		try {
			const defesa = await this.defesaModel.findOne({
				where: { id_tcc: idTcc, membro_banca: membroBanca, fase },
				include: [{ model: TrabalhoConclusaoEntity, attributes: ["ano", "semestre", "id_curso", "fase"] }],
				transaction: t,
			});

			if (!defesa) {
				await t.rollback();
				return { sucesso: false, motivo: "Defesa não encontrada" };
			}

			const sucesso = await this.defesaModel.destroy({
				where: { id_tcc: idTcc, membro_banca: membroBanca, fase },
				transaction: t,
			});

			if (!sucesso) {
				await t.rollback();
				return { sucesso: false, motivo: "Defesa não encontrada" };
			}

			if (defesa.data_defesa) {
				const iso = defesa.data_defesa.toISOString();
				const data = iso.split("T")[0];
				const hora = iso.split("T")[1].substring(0, 8);
				const { horaAnterior, horaPosterior } = calcularHorarios(hora);
				const trabalhoConclusao = defesa.trabalhoConclusao!;

				const dadosBase = {
					ano: trabalhoConclusao.ano,
					semestre: trabalhoConclusao.semestre,
					id_curso: trabalhoConclusao.id_curso,
					fase: trabalhoConclusao.fase,
					codigo_docente: membroBanca,
					data_defesa: data,
				};

				await this.disponibilidadeModel.create({ ...dadosBase, hora_defesa: hora }, { transaction: t });

				if (horaAnterior) {
					await this.disponibilidadeModel.create({ ...dadosBase, hora_defesa: horaAnterior }, { transaction: t });
				}

				if (horaPosterior) {
					await this.disponibilidadeModel.create({ ...dadosBase, hora_defesa: horaPosterior }, { transaction: t });
				}
			}

			await t.commit();
			return { sucesso: true, disponibilidadesRestauradas: !!defesa.data_defesa };
		} catch (error) {
			await t.rollback();
			throw error;
		}
	}

	async agendarDefesa(
		dados: DadosAgendamento,
		calcularHorarios: (hora: string) => HorariosAdjacentes,
	): Promise<{ sucesso: boolean; horarioAnteriorRemovido: boolean; horarioPosteriorRemovido: boolean }> {
		const t = await this.sequelize.transaction();

		try {
			const { id_tcc, fase, data, hora, codigo_orientador, membros_banca } = dados;

			const docentes = [
				{ codigo: codigo_orientador, orientador: true },
				{ codigo: membros_banca[0], orientador: false },
				{ codigo: membros_banca[1], orientador: false },
			];

			const [year, month, day] = data.split("-").map(Number);
			const [hh, mm, ss] = hora.split(":").map(Number);
			const dataHora = new Date(Date.UTC(year, month - 1, day, hh, mm, ss || 0));

			for (const d of docentes) {
				await this.defesaModel.create(
					{ id_tcc, membro_banca: d.codigo, fase, data_defesa: dataHora, orientador: d.orientador } as Partial<DefesaEntity>,
					{ transaction: t },
				);
			}

			const tcc = await this.trabalhoConclusaoModel.findOne({ where: { id: id_tcc }, transaction: t });

			if (!tcc) {
				throw new Error("TCC não encontrado");
			}

			const { horaAnterior, horaPosterior } = calcularHorarios(hora);

			const removerParaDocente = async (codigo: string) => {
				const dadosBase = { ano: tcc.ano, semestre: tcc.semestre, id_curso: tcc.id_curso, fase: tcc.fase, codigo_docente: codigo, data_defesa: data };

				await this.disponibilidadeModel.destroy({ where: { ...dadosBase, hora_defesa: hora }, transaction: t });

				if (horaAnterior) {
					await this.disponibilidadeModel.destroy({ where: { ...dadosBase, hora_defesa: horaAnterior }, transaction: t });
				}

				if (horaPosterior) {
					await this.disponibilidadeModel.destroy({ where: { ...dadosBase, hora_defesa: horaPosterior }, transaction: t });
				}
			};

			await removerParaDocente(codigo_orientador);
			await removerParaDocente(membros_banca[0]);
			await removerParaDocente(membros_banca[1]);

			await t.commit();
			return { sucesso: true, horarioAnteriorRemovido: !!horaAnterior, horarioPosteriorRemovido: !!horaPosterior };
		} catch (error) {
			await t.rollback();
			throw error;
		}
	}

	async gerenciarBancaDefesa(dados: DadosGerenciarBanca): Promise<{
		sucesso: boolean;
		membros_adicionados: number;
		membros_removidos: number;
		orientador_incluido: boolean;
		data_defesa_atualizada: boolean;
	}> {
		const t = await this.sequelize.transaction();

		try {
			const {
				id_tcc,
				fase,
				membros_novos,
				membros_existentes,
				convites_banca_existentes,
				orientador_codigo,
				data_hora_defesa,
				alteracoes = [],
			} = dados;

			const dataAtual = new Date().toISOString();
			const mensagemPadrao = "Informado pelo professor do CCR";

			for (const membroExistente of membros_existentes) {
				if (!membros_novos.includes(membroExistente)) {
					await this.defesaModel.destroy({
						where: { id_tcc, membro_banca: membroExistente, fase, orientador: false },
						transaction: t,
					});

					await this.conviteModel.destroy({
						where: { id_tcc, codigo_docente: membroExistente, fase, orientacao: false },
						transaction: t,
					});
				}
			}

			for (const membroNovo of membros_novos) {
				if (!membros_existentes.includes(membroNovo)) {
					const conviteExistente = convites_banca_existentes?.find((c) => c.codigo_docente === membroNovo);

					if (!conviteExistente || conviteExistente.aceito === false) {
						await this.conviteModel.create(
							{
								id_tcc,
								codigo_docente: membroNovo,
								fase: Number(fase),
								data_envio: dataAtual,
								mensagem_envio: mensagemPadrao,
								data_feedback: dataAtual,
								aceito: true,
								mensagem_feedback: mensagemPadrao,
								orientacao: false,
							} as unknown as Partial<ConviteEntity>,
							{ transaction: t },
						);
					}

					await this.defesaModel.create(
						{
							id_tcc,
							membro_banca: membroNovo,
							fase: Number(fase),
							orientador: false,
							data_defesa: data_hora_defesa ? new Date(data_hora_defesa) : null,
						} as Partial<DefesaEntity>,
						{ transaction: t },
					);
				}
			}

			if (orientador_codigo && membros_novos.length > 0) {
				const defesaOrientadorExistente = await this.defesaModel.findOne({
					where: { id_tcc, membro_banca: orientador_codigo, fase, orientador: true },
					transaction: t,
				});

				if (!defesaOrientadorExistente) {
					await this.defesaModel.create(
						{
							id_tcc,
							membro_banca: orientador_codigo,
							fase: Number(fase),
							orientador: true,
							data_defesa: data_hora_defesa ? new Date(data_hora_defesa) : null,
						} as Partial<DefesaEntity>,
						{ transaction: t },
					);
				}
			}

			for (const alteracao of alteracoes) {
				const { membro_antigo, membro_novo } = alteracao;

				if (membro_antigo && membro_novo) {
					const conviteAntigo = convites_banca_existentes?.find((c) => c.codigo_docente === membro_antigo);

					if (conviteAntigo && conviteAntigo.aceito === true) {
						await this.conviteModel.destroy({
							where: { id_tcc, codigo_docente: membro_antigo, fase, orientacao: false },
							transaction: t,
						});

						const mensagemAlteracao = `Alteração de banca informada pelo professor do CCR de ${membro_antigo} para ${membro_novo}`;

						await this.conviteModel.create(
							{
								id_tcc,
								codigo_docente: membro_novo,
								fase: Number(fase),
								data_envio: dataAtual,
								mensagem_envio: mensagemAlteracao,
								data_feedback: dataAtual,
								aceito: true,
								mensagem_feedback: mensagemAlteracao,
								orientacao: false,
							} as unknown as Partial<ConviteEntity>,
							{ transaction: t },
						);
					}
				}
			}

			if (data_hora_defesa !== undefined) {
				const dataDefesa = data_hora_defesa ? new Date(data_hora_defesa) : null;

				await this.defesaModel.update({ data_defesa: dataDefesa }, { where: { id_tcc, fase }, transaction: t });

				if (dataDefesa && membros_novos.length >= 2) {
					const tccAtual = await this.trabalhoConclusaoModel.findOne({ where: { id: id_tcc }, transaction: t });

					if (tccAtual && tccAtual.etapa === 5) {
						await this.trabalhoConclusaoModel.update({ etapa: 6 }, { where: { id: id_tcc }, transaction: t });
					}
				}
			}

			await t.commit();
			return {
				sucesso: true,
				membros_adicionados: membros_novos.filter((m) => !membros_existentes.includes(m)).length,
				membros_removidos: membros_existentes.filter((m) => !membros_novos.includes(m)).length,
				orientador_incluido: !!orientador_codigo,
				data_defesa_atualizada: data_hora_defesa !== undefined,
			};
		} catch (error) {
			await t.rollback();
			throw error;
		}
	}

	async adicionarMembroExterno(dados: {
		id_tcc: number;
		fase: number;
		codigo_docente: string;
		data_hora_defesa?: string | null;
	}): Promise<{ sucesso: boolean; motivo?: string }> {
		const { id_tcc, fase, codigo_docente, data_hora_defesa } = dados;
		const t = await this.sequelize.transaction();

		try {
			const defesaExistente = await this.defesaModel.findOne({
				where: { id_tcc, membro_banca: codigo_docente, fase },
				transaction: t,
			});

			if (defesaExistente) {
				await t.rollback();
				return { sucesso: false, motivo: "Este docente já está na banca deste TCC" };
			}

			const externoBancaExistente = await this.defesaModel.findOne({
				where: { id_tcc, fase, orientador: false },
				include: [{ model: DocenteEntity, as: "membroBanca", where: { externo: true }, required: true }],
				transaction: t,
			});

			if (externoBancaExistente) {
				await t.rollback();
				return { sucesso: false, motivo: "Já existe um membro externo nesta banca" };
			}

			await this.defesaModel.create(
				{
					id_tcc,
					membro_banca: codigo_docente,
					fase: Number(fase),
					orientador: false,
					data_defesa: data_hora_defesa ? new Date(data_hora_defesa) : null,
				} as Partial<DefesaEntity>,
				{ transaction: t },
			);

			await t.commit();
			return { sucesso: true };
		} catch (error) {
			await t.rollback();
			throw error;
		}
	}

	async listarMembrosExternosTcc(idTcc: number): Promise<DefesaEntity[]> {
		return this.defesaModel.findAll({
			where: { id_tcc: idTcc, orientador: false },
			include: [
				{
					model: DocenteEntity,
					as: "membroBanca",
					where: { externo: true },
					required: true,
					attributes: ["codigo", "nome", "email", "siape", "externo", "instituicao"],
				},
			],
		});
	}

	async buscarDadosAta(
		idTcc: number,
		fase: number,
	): Promise<{ defesas: DefesaEntity[]; coOrientacao: OrientacaoEntity | null; tcc: TrabalhoConclusaoEntity } | null> {
		const defesas = await this.defesaModel.findAll({
			where: { id_tcc: idTcc, fase },
			include: [
				{
					model: TrabalhoConclusaoEntity,
					include: [
						{ model: DicenteEntity, attributes: ["matricula", "nome", "email"] },
						{ model: CursoEntity, attributes: ["id", "nome"] },
					],
				},
				{
					model: DocenteEntity,
					as: "membroBanca",
					attributes: ["codigo", "nome", "email", "siape", "externo", "instituicao"],
				},
			],
			order: [["orientador", "DESC"]],
		});

		if (!defesas || defesas.length === 0) return null;

		const tcc = defesas[0].trabalhoConclusao!;
		const coOrientacao = await this.orientacaoModel.findOne({
			where: { id_tcc: idTcc, orientador: false },
			include: [
				{ model: DocenteEntity, attributes: ["codigo", "nome", "email", "siape", "externo", "instituicao"] },
			],
		});

		return { defesas, coOrientacao, tcc };
	}

	async removerMembroExterno(idTcc: number, codigoDocente: string, fase: number): Promise<boolean> {
		const deleted = await this.defesaModel.destroy({
			where: { id_tcc: idTcc, membro_banca: codigoDocente, fase, orientador: false },
		});
		return deleted > 0;
	}
}
