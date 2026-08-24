import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { CursoEntity, DocenteDisponibilidadeBancaEntity, DocenteEntity } from "../database/entities";

export interface FiltrosDisponibilidade {
	ano?: string;
	semestre?: string;
	id_curso?: string;
	fase?: string;
	codigo_docente?: string;
	data_defesa?: string;
}

export interface DadosDisponibilidade {
	ano: number | string;
	semestre: number | string;
	id_curso: number | string;
	fase: number | string;
	codigo_docente: string;
	data_defesa: string;
	hora_defesa: string;
}

const includeDocenteCurso = [
	{ model: DocenteEntity, attributes: ["codigo", "nome", "email"] },
	{ model: CursoEntity, attributes: ["id", "nome", "codigo"] },
];

@Injectable()
export class DisponibilidadeBancaRepository {
	constructor(
		@InjectModel(DocenteDisponibilidadeBancaEntity)
		private readonly disponibilidadeModel: typeof DocenteDisponibilidadeBancaEntity,
	) {}

	async obterTodasDisponibilidades(filtros: FiltrosDisponibilidade): Promise<DocenteDisponibilidadeBancaEntity[]> {
		const { ano, semestre, id_curso, fase, codigo_docente, data_defesa } = filtros;
		const whereClause: Record<string, unknown> = {};

		if (ano) whereClause.ano = parseInt(ano, 10);
		if (semestre) whereClause.semestre = parseInt(semestre, 10);
		if (id_curso) whereClause.id_curso = parseInt(id_curso, 10);
		if (fase) whereClause.fase = parseInt(fase, 10);
		if (codigo_docente) whereClause.codigo_docente = codigo_docente;
		if (data_defesa) whereClause.data_defesa = data_defesa;

		return this.disponibilidadeModel.findAll({
			where: whereClause,
			include: includeDocenteCurso,
			order: [
				["data_defesa", "ASC"],
				["hora_defesa", "ASC"],
			],
		});
	}

	async obterDisponibilidade(
		ano: string,
		semestre: string,
		idCurso: string,
		fase: string,
		codigoDocente: string,
		dataDefesa: string,
		horaDefesa: string,
	): Promise<DocenteDisponibilidadeBancaEntity | null> {
		return this.disponibilidadeModel.findOne({
			where: {
				ano: parseInt(ano, 10),
				semestre: parseInt(semestre, 10),
				id_curso: parseInt(idCurso, 10),
				fase: parseInt(fase, 10),
				codigo_docente: codigoDocente,
				data_defesa: dataDefesa,
				hora_defesa: horaDefesa,
			},
			include: includeDocenteCurso,
		});
	}

	async criarDisponibilidade(dados: Partial<DadosDisponibilidade>): Promise<DocenteDisponibilidadeBancaEntity> {
		const dadosNormalizados = {
			ano: parseInt(String(dados.ano), 10),
			semestre: parseInt(String(dados.semestre), 10),
			id_curso: parseInt(String(dados.id_curso), 10),
			fase: parseInt(String(dados.fase), 10),
			codigo_docente: dados.codigo_docente,
			data_defesa: dados.data_defesa,
			hora_defesa: dados.hora_defesa,
		};

		const disponibilidade = this.disponibilidadeModel.build(dadosNormalizados);
		await disponibilidade.save();
		return disponibilidade;
	}

	async atualizarDisponibilidade(
		ano: string,
		semestre: string,
		idCurso: string,
		fase: string,
		codigoDocente: string,
		dataDefesa: string,
		horaDefesa: string,
		dados: Partial<DocenteDisponibilidadeBancaEntity>,
	): Promise<boolean> {
		const [linhasAfetadas] = await this.disponibilidadeModel.update(dados, {
			where: {
				ano: parseInt(ano, 10),
				semestre: parseInt(semestre, 10),
				id_curso: parseInt(idCurso, 10),
				fase: parseInt(fase, 10),
				codigo_docente: codigoDocente,
				data_defesa: dataDefesa,
				hora_defesa: horaDefesa,
			},
		});
		return linhasAfetadas > 0;
	}

	async criarOuAtualizarDisponibilidade(dados: Partial<DadosDisponibilidade>): Promise<DocenteDisponibilidadeBancaEntity> {
		const where = {
			ano: parseInt(String(dados.ano), 10),
			semestre: parseInt(String(dados.semestre), 10),
			id_curso: parseInt(String(dados.id_curso), 10),
			fase: parseInt(String(dados.fase), 10),
			codigo_docente: dados.codigo_docente,
			data_defesa: dados.data_defesa,
			hora_defesa: dados.hora_defesa,
		};

		const [disponibilidade] = await this.disponibilidadeModel.findOrCreate({ where, defaults: where });
		return disponibilidade;
	}

	async deletarDisponibilidade(
		ano: string | number,
		semestre: string | number,
		idCurso: string | number,
		fase: string | number,
		codigoDocente: string,
		dataDefesa: string,
		horaDefesa: string,
	): Promise<boolean> {
		const deleted = await this.disponibilidadeModel.destroy({
			where: {
				ano: parseInt(String(ano), 10),
				semestre: parseInt(String(semestre), 10),
				id_curso: parseInt(String(idCurso), 10),
				fase: parseInt(String(fase), 10),
				codigo_docente: codigoDocente,
				data_defesa: dataDefesa,
				hora_defesa: horaDefesa,
			},
		});
		return deleted > 0;
	}

	async obterDisponibilidadesPorDocenteEOferta(
		codigoDocente: string,
		ano: string,
		semestre: string,
		idCurso: string,
		fase: string,
	): Promise<DocenteDisponibilidadeBancaEntity[]> {
		return this.disponibilidadeModel.findAll({
			where: {
				codigo_docente: codigoDocente,
				ano: parseInt(ano, 10),
				semestre: parseInt(semestre, 10),
				id_curso: parseInt(idCurso, 10),
				fase: parseInt(fase, 10),
			},
			order: [
				["data_defesa", "ASC"],
				["hora_defesa", "ASC"],
			],
		});
	}
}
