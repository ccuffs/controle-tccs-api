import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { AnoSemestreEntity } from "../database/entities";

@Injectable()
export class AnoSemestreRepository {
	constructor(
		@InjectModel(AnoSemestreEntity)
		private readonly anoSemestreModel: typeof AnoSemestreEntity,
	) {}

	async obterTodosAnoSemestres(): Promise<AnoSemestreEntity[]> {
		return this.anoSemestreModel.findAll({
			order: [
				["ano", "ASC"],
				["semestre", "ASC"],
			],
		});
	}
}
