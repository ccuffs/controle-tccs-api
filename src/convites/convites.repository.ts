import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Transaction } from "sequelize";
import { ConviteEntity, CursoEntity, DicenteEntity, DocenteEntity, TrabalhoConclusaoEntity } from "../database/entities";

export interface FiltrosConvites {
	id_tcc?: string;
	codigo_docente?: string;
	aceito?: string;
}

const includeConvite = [
	{
		model: TrabalhoConclusaoEntity,
		include: [
			{ model: DicenteEntity, attributes: ["matricula", "nome", "email"] },
			{ model: CursoEntity, attributes: ["id", "nome", "codigo"] },
		],
	},
	{ model: DocenteEntity, attributes: ["codigo", "nome", "email", "siape"] },
];

@Injectable()
export class ConvitesRepository {
	constructor(
		@InjectModel(ConviteEntity)
		private readonly conviteModel: typeof ConviteEntity,
		@InjectModel(TrabalhoConclusaoEntity)
		private readonly trabalhoConclusaoModel: typeof TrabalhoConclusaoEntity,
	) {}

	async obterTodosConvites(filtros: FiltrosConvites): Promise<ConviteEntity[]> {
		const { id_tcc, codigo_docente, aceito } = filtros;
		const whereClause: Record<string, unknown> = {};

		if (id_tcc) whereClause.id_tcc = parseInt(id_tcc, 10);
		if (codigo_docente) whereClause.codigo_docente = codigo_docente;
		if (aceito !== undefined) whereClause.aceito = aceito === "true";

		return this.conviteModel.findAll({
			where: whereClause,
			include: includeConvite,
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

	async obterConvitesDocente(codigoDocente: string): Promise<ConviteEntity[]> {
		return this.conviteModel.findAll({
			where: { codigo_docente: codigoDocente },
			include: includeConvite,
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
