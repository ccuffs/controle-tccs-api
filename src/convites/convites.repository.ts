import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Transaction } from "sequelize";
import { aplicarDesde, periodoDesde } from "../common/periodo-desde";
import { ConviteEntity, CursoEntity, DicenteEntity, DocenteEntity, TrabalhoConclusaoEntity } from "../database/entities";

export interface FiltrosConvites {
	id_tcc?: string;
	codigo_docente?: string;
	aceito?: string;
	/** Filtros aplicados ao TCC do convite (período do seletor do topo e dono do TCC). */
	ano?: string;
	semestre?: string;
	matricula?: string;
	/** "A partir de" (opção "Todos os períodos" restrita). */
	desde_ano?: string;
	desde_semestre?: string;
}

export type FiltrosTccConvite = Pick<FiltrosConvites, "ano" | "semestre" | "matricula" | "desde_ano" | "desde_semestre">;

/** Include padrão; com filtros de TCC, só traz convites cujo TCC os atende. */
function includeConvite(filtrosTcc: FiltrosTccConvite = {}) {
	const tccWhere: Record<string | symbol, unknown> = {};
	const ano = Number(filtrosTcc.ano);
	const semestre = Number(filtrosTcc.semestre);
	if (filtrosTcc.ano && Number.isInteger(ano)) tccWhere.ano = ano;
	if (filtrosTcc.semestre && Number.isInteger(semestre)) tccWhere.semestre = semestre;
	if (filtrosTcc.matricula) tccWhere.matricula = filtrosTcc.matricula;
	aplicarDesde(tccWhere, periodoDesde(filtrosTcc.desde_ano, filtrosTcc.desde_semestre));
	const filtrar = Reflect.ownKeys(tccWhere).length > 0;

	return [
		{
			model: TrabalhoConclusaoEntity,
			...(filtrar ? { where: tccWhere, required: true } : {}),
			include: [
				{ model: DicenteEntity, attributes: ["matricula", "nome", "email"] },
				{ model: CursoEntity, attributes: ["id", "nome", "codigo"] },
			],
		},
		{ model: DocenteEntity, attributes: ["codigo", "nome", "email", "siape"] },
	];
}

@Injectable()
export class ConvitesRepository {
	constructor(
		@InjectModel(ConviteEntity)
		private readonly conviteModel: typeof ConviteEntity,
		@InjectModel(TrabalhoConclusaoEntity)
		private readonly trabalhoConclusaoModel: typeof TrabalhoConclusaoEntity,
	) {}

	async obterTodosConvites(filtros: FiltrosConvites): Promise<ConviteEntity[]> {
		const { id_tcc, codigo_docente, aceito, ano, semestre, matricula, desde_ano, desde_semestre } = filtros;
		const whereClause: Record<string, unknown> = {};

		if (id_tcc) whereClause.id_tcc = parseInt(id_tcc, 10);
		if (codigo_docente) whereClause.codigo_docente = codigo_docente;
		if (aceito !== undefined) whereClause.aceito = aceito === "true";

		return this.conviteModel.findAll({
			where: whereClause,
			include: includeConvite({ ano, semestre, matricula, desde_ano, desde_semestre }),
			order: [["data_envio", "DESC"]],
		});
	}

	async obterConvitePorIdEDocente(idTcc: number, codigoDocente: string, fase: number): Promise<ConviteEntity | null> {
		return this.conviteModel.findOne({
			where: { id_tcc: idTcc, codigo_docente: codigoDocente, fase },
			include: [{ model: DocenteEntity, attributes: ["codigo", "nome", "email", "siape"] }],
		});
	}

	async verificarConviteExiste(idTcc: number, codigoDocente: string, fase: number): Promise<boolean> {
		const convite = await this.conviteModel.findOne({ where: { id_tcc: idTcc, codigo_docente: codigoDocente, fase } });
		return convite !== null;
	}

	async criarConvite(dadosConvite: Partial<ConviteEntity>): Promise<ConviteEntity> {
		const convite = this.conviteModel.build(dadosConvite);
		await convite.save();
		return convite;
	}

	async atualizarConvite(
		idTcc: number,
		codigoDocente: string,
		fase: number,
		dadosConvite: Partial<ConviteEntity>,
		transaction: Transaction | null = null,
	): Promise<boolean> {
		const [linhasAfetadas] = await this.conviteModel.update(dadosConvite, {
			where: { id_tcc: idTcc, codigo_docente: codigoDocente, fase },
			transaction: transaction ?? undefined,
		});
		return linhasAfetadas > 0;
	}

	async deletarConvite(idTcc: number, codigoDocente: string, fase: number): Promise<boolean> {
		const deleted = await this.conviteModel.destroy({ where: { id_tcc: idTcc, codigo_docente: codigoDocente, fase } });
		return deleted > 0;
	}

	async obterConvitesDocente(codigoDocente: string, filtrosTcc: FiltrosTccConvite = {}): Promise<ConviteEntity[]> {
		return this.conviteModel.findAll({
			where: { codigo_docente: codigoDocente },
			include: includeConvite(filtrosTcc),
			order: [["data_envio", "DESC"]],
		});
	}

	async obterTrabalhoConclusaoPorId(idTcc: number): Promise<TrabalhoConclusaoEntity | null> {
		return this.trabalhoConclusaoModel.findOne({
			where: { id: idTcc },
			attributes: ["id", "ano", "semestre", "id_curso", "fase"],
		});
	}
}
