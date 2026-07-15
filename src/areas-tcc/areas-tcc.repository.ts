import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { AreaTccEntity, DocenteEntity } from "../database/entities";

@Injectable()
export class AreasTccRepository {
	constructor(
		@InjectModel(AreaTccEntity)
		private readonly areaTccModel: typeof AreaTccEntity,
	) {}

	async obterTodasAreasTcc(): Promise<AreaTccEntity[]> {
		return this.areaTccModel.findAll({
			include: [{ model: DocenteEntity, attributes: ["codigo", "nome", "email"] }],
			order: [["descricao", "ASC"]],
		});
	}

	async obterAreasTccPorDocente(codigoDocente: string): Promise<AreaTccEntity[]> {
		return this.areaTccModel.findAll({
			where: { codigo_docente: codigoDocente },
			order: [["descricao", "ASC"]],
		});
	}

	async obterAreaTccPorId(id: number): Promise<AreaTccEntity | null> {
		return this.areaTccModel.findByPk(id, {
			include: [{ model: DocenteEntity, attributes: ["codigo", "nome", "email"] }],
		});
	}

	async criarAreaTcc(dadosArea: Partial<AreaTccEntity>): Promise<AreaTccEntity> {
		const area = this.areaTccModel.build(dadosArea);
		await area.save();
		return area;
	}

	async atualizarAreaTcc(id: number, dadosArea: Partial<AreaTccEntity>): Promise<boolean> {
		const [linhasAfetadas] = await this.areaTccModel.update(dadosArea, { where: { id } });
		return linhasAfetadas > 0;
	}

	async deletarAreaTcc(id: number): Promise<boolean> {
		const deleted = await this.areaTccModel.destroy({ where: { id } });
		return deleted > 0;
	}
}
