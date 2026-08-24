import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Op } from "sequelize";
import { DocenteEntity } from "../database/entities";

const DOCENTE_ATTRS = ["codigo", "email", "nome", "sala", "siape", "externo", "instituicao", "id_usuario"];

@Injectable()
export class DocentesRepository {
	constructor(
		@InjectModel(DocenteEntity)
		private readonly docenteModel: typeof DocenteEntity,
	) {}

	async obterTodosDocentes(): Promise<DocenteEntity[]> {
		return this.docenteModel.findAll({
			attributes: DOCENTE_ATTRS,
			order: [["nome", "ASC"]],
		});
	}

	async obterDocentePorCodigo(codigo: string): Promise<DocenteEntity | null> {
		return this.docenteModel.findOne({
			attributes: DOCENTE_ATTRS,
			where: { codigo },
		});
	}

	async obterDocentePorEmail(email: string): Promise<DocenteEntity | null> {
		return this.docenteModel.findOne({
			attributes: DOCENTE_ATTRS,
			where: { email },
		});
	}

	async buscarExternosPorNome(nome: string): Promise<DocenteEntity[]> {
		return this.docenteModel.findAll({
			attributes: DOCENTE_ATTRS,
			where: {
				externo: true,
				nome: { [Op.iLike]: `%${nome}%` },
			},
			order: [["nome", "ASC"]],
			limit: 10,
		});
	}

	async criarDocente(dadosDocente: Partial<DocenteEntity>): Promise<DocenteEntity> {
		const docente = this.docenteModel.build(dadosDocente);
		await docente.save();
		return docente;
	}

	async atualizarDocente(codigo: string, dadosDocente: Partial<DocenteEntity>): Promise<boolean> {
		const [linhasAfetadas] = await this.docenteModel.update(dadosDocente, {
			where: { codigo },
		});
		return linhasAfetadas > 0;
	}

	async deletarDocente(codigo: string): Promise<boolean> {
		const deleted = await this.docenteModel.destroy({ where: { codigo } });
		return deleted > 0;
	}

	async obterDocentePorUsuario(id_usuario: string): Promise<DocenteEntity | null> {
		return this.docenteModel.findOne({
			attributes: DOCENTE_ATTRS,
			where: { id_usuario },
		});
	}
}
