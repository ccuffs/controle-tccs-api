import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Op, WhereOptions } from "sequelize";
import { CursoEntity, OfertaTccEntity, TrabalhoConclusaoEntity } from "../database/entities";

const includeCurso = [{ model: CursoEntity, attributes: ["id", "nome", "codigo"] }];
const ordemPadrao: [string, string][] = [
	["ano", "DESC"],
	["semestre", "DESC"],
	["fase", "ASC"],
];

export interface OfertaTccChave {
	ano: number;
	semestre: number;
	id_curso: number;
	fase: number;
}

@Injectable()
export class OfertasTccRepository {
	constructor(
		@InjectModel(OfertaTccEntity)
		private readonly ofertaTccModel: typeof OfertaTccEntity,
		@InjectModel(TrabalhoConclusaoEntity)
		private readonly trabalhoConclusaoModel: typeof TrabalhoConclusaoEntity,
	) {}

	async buscarOfertasTcc(where: WhereOptions): Promise<OfertaTccEntity[]> {
		return this.ofertaTccModel.findAll({ where, include: includeCurso, order: ordemPadrao });
	}

	async buscarOfertaTccPorChave(where: OfertaTccChave): Promise<OfertaTccEntity | null> {
		return this.ofertaTccModel.findOne({ where: where as unknown as WhereOptions, include: includeCurso });
	}

	async verificarOfertaExistente(where: OfertaTccChave): Promise<OfertaTccEntity | null> {
		return this.ofertaTccModel.findOne({ where: where as unknown as WhereOptions });
	}

	async criarOfertaTcc(dadosOferta: Partial<OfertaTccEntity>): Promise<OfertaTccEntity> {
		const oferta = this.ofertaTccModel.build(dadosOferta);
		await oferta.save();
		return oferta;
	}

	async atualizarOfertaTcc(where: OfertaTccChave, dadosOferta: Partial<OfertaTccEntity>): Promise<number> {
		const [updatedRowsCount] = await this.ofertaTccModel.update(dadosOferta, { where: where as unknown as WhereOptions });
		return updatedRowsCount;
	}

	async contarTrabalhosVinculados(where: OfertaTccChave): Promise<number> {
		return this.trabalhoConclusaoModel.count({ where: where as unknown as WhereOptions });
	}

	async deletarOfertaTcc(where: OfertaTccChave): Promise<number> {
		return this.ofertaTccModel.destroy({ where: where as unknown as WhereOptions });
	}

	async buscarOfertasAtivas(anoMinimo: number): Promise<OfertaTccEntity[]> {
		return this.ofertaTccModel.findAll({
			where: { ano: { [Op.gte]: anoMinimo } },
			include: includeCurso,
			order: ordemPadrao,
		});
	}

	async buscarUltimaOfertaTcc(): Promise<OfertaTccEntity | null> {
		return this.ofertaTccModel.findOne({ include: includeCurso, order: ordemPadrao });
	}
}
