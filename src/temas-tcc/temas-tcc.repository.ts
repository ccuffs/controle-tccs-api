import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { AreaTccEntity, CursoEntity, DocenteEntity, DocenteOfertaEntity, TemaTccEntity } from "../database/entities";

const DOCENTE_ATTRS = ["codigo", "email", "nome", "sala", "siape", "id_usuario"];

@Injectable()
export class TemasTccRepository {
	constructor(
		@InjectModel(TemaTccEntity)
		private readonly temaTccModel: typeof TemaTccEntity,
		@InjectModel(DocenteOfertaEntity)
		private readonly docenteOfertaModel: typeof DocenteOfertaEntity,
	) {}

	async obterTodosTemasTcc(): Promise<TemaTccEntity[]> {
		return this.temaTccModel.findAll({
			include: [
				{ model: AreaTccEntity, required: true },
				{ model: DocenteEntity, required: true, attributes: DOCENTE_ATTRS },
			],
		});
	}

	async obterTemasTccPorCurso(idCurso: string): Promise<TemaTccEntity[]> {
		return this.temaTccModel.findAll({
			include: [
				{ model: AreaTccEntity, required: true },
				{
					model: DocenteEntity,
					required: true,
					include: [
						{
							model: CursoEntity,
							as: "cursosOrientacao",
							required: true,
							where: { id: idCurso },
							attributes: [],
						},
					],
				},
			],
		});
	}

	async obterTemasTccPorDocente(codigoDocente: string): Promise<TemaTccEntity[]> {
		return this.temaTccModel.findAll({
			where: { codigo_docente: codigoDocente },
			include: [
				{ model: AreaTccEntity, required: true },
				{ model: DocenteEntity, required: true, attributes: DOCENTE_ATTRS },
			],
		});
	}

	async obterTemasTccPorDocenteECurso(codigoDocente: string, idCurso: string): Promise<TemaTccEntity[]> {
		return this.temaTccModel.findAll({
			where: { codigo_docente: codigoDocente },
			include: [
				{ model: AreaTccEntity, required: true },
				{
					model: DocenteEntity,
					required: true,
					include: [
						{
							model: CursoEntity,
							as: "cursosOrientacao",
							required: true,
							where: { id: idCurso },
							attributes: [],
						},
					],
				},
			],
		});
	}

	async obterTemaTccPorId(id: number): Promise<TemaTccEntity | null> {
		return this.temaTccModel.findByPk(id, {
			include: [
				{ model: AreaTccEntity, required: true },
				{ model: DocenteEntity, required: true, attributes: DOCENTE_ATTRS },
			],
		});
	}

	async criarTemaTcc(dadosTema: Partial<TemaTccEntity>): Promise<TemaTccEntity> {
		const tema = this.temaTccModel.build(dadosTema);
		return tema.save();
	}

	async atualizarTemaTcc(id: number, dadosTema: Partial<TemaTccEntity>): Promise<boolean> {
		const [linhasAfetadas] = await this.temaTccModel.update(dadosTema, { where: { id } });
		return linhasAfetadas > 0;
	}

	/** `vagas` não existe como coluna em TemaTcc (nem no model, nem na migration) — este
	 * update é um no-op silencioso, replicando fielmente o comportamento (já quebrado)
	 * de temaTccRepository.atualizarVagasTemaTcc no legado. O conceito real de vagas por
	 * oferta fica em DocenteOferta (ver criarOuAtualizarOfertaDocente). */
	async atualizarVagasTemaTcc(id: number, vagas: number): Promise<boolean> {
		const [linhasAfetadas] = await this.temaTccModel.update({ vagas } as unknown as Partial<TemaTccEntity>, {
			where: { id },
		});
		return linhasAfetadas > 0;
	}

	async deletarTemaTcc(id: number): Promise<boolean> {
		const deleted = await this.temaTccModel.destroy({ where: { id } });
		return deleted > 0;
	}

	async buscarOfertaDocente(
		ano: number,
		semestre: number,
		idCurso: string,
		codigoDocente: string,
		fase = 1,
	): Promise<DocenteOfertaEntity | null> {
		return this.docenteOfertaModel.findOne({
			where: {
				ano,
				semestre,
				id_curso: parseInt(idCurso, 10),
				fase,
				codigo_docente: codigoDocente,
			},
		});
	}

	async criarOuAtualizarOfertaDocente(
		ano: number,
		semestre: number,
		idCurso: string,
		codigoDocente: string,
		vagas: number,
	): Promise<DocenteOfertaEntity> {
		const [docenteOferta, created] = await this.docenteOfertaModel.findOrCreate({
			where: {
				ano,
				semestre,
				id_curso: parseInt(idCurso, 10),
				fase: 1,
				codigo_docente: codigoDocente,
			},
			defaults: { vagas: Number(vagas) || 0 },
		});

		if (!created) {
			await docenteOferta.update({ vagas: Number(vagas) || 0 });
		}

		return docenteOferta;
	}
}
