import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Op, Transaction } from "sequelize";
import {
	CursoEntity,
	DocenteEntity,
	OrientacaoEntity,
	OrientadorCursoEntity,
	TrabalhoConclusaoEntity,
	UsuarioCursoEntity,
	UsuarioEntity,
	UsuarioGrupoEntity,
} from "../database/entities";

@Injectable()
export class OrientadoresRepository {
	constructor(
		@InjectModel(OrientadorCursoEntity)
		private readonly orientadorCursoModel: typeof OrientadorCursoEntity,
		@InjectModel(DocenteEntity)
		private readonly docenteModel: typeof DocenteEntity,
		@InjectModel(UsuarioEntity)
		private readonly usuarioModel: typeof UsuarioEntity,
		@InjectModel(UsuarioGrupoEntity)
		private readonly usuarioGrupoModel: typeof UsuarioGrupoEntity,
		@InjectModel(UsuarioCursoEntity)
		private readonly usuarioCursoModel: typeof UsuarioCursoEntity,
		@InjectModel(OrientacaoEntity)
		private readonly orientacaoModel: typeof OrientacaoEntity,
	) {}

	async obterTodasOrientacoes(): Promise<OrientadorCursoEntity[]> {
		return this.orientadorCursoModel.findAll({
			include: [
				{ model: DocenteEntity, as: "docente", attributes: ["codigo", "nome", "email", "siape"] },
				{ model: CursoEntity, as: "curso", attributes: ["id", "nome", "codigo", "turno"] },
			],
			order: [[{ model: DocenteEntity, as: "docente" }, "nome", "ASC"]],
		});
	}

	async obterOrientacoesPorDocente(codigoDocente: string): Promise<OrientadorCursoEntity[]> {
		return this.orientadorCursoModel.findAll({
			where: { codigo_docente: codigoDocente },
			include: [{ model: CursoEntity, as: "curso", attributes: ["id", "nome", "codigo", "turno"] }],
			order: [[{ model: CursoEntity, as: "curso" }, "nome", "ASC"]],
		});
	}

	async obterOrientacoesPorCurso(idCurso: number): Promise<OrientadorCursoEntity[]> {
		return this.orientadorCursoModel.findAll({
			where: { id_curso: idCurso },
			include: [{ model: DocenteEntity, as: "docente", attributes: ["codigo", "nome", "email", "siape"] }],
			order: [[{ model: DocenteEntity, as: "docente" }, "nome", "ASC"]],
		});
	}

	/** Cria o vínculo orientador × curso; não falha se ele já existir. */
	async criarOrientacao(idCurso: number, codigoDocente: string, transaction: Transaction): Promise<OrientadorCursoEntity> {
		const [orientacao] = await this.orientadorCursoModel.findOrCreate({
			where: { id_curso: idCurso, codigo_docente: codigoDocente },
			defaults: { id_curso: idCurso, codigo_docente: codigoDocente },
			transaction,
		});
		return orientacao;
	}

	async buscarDocente(codigo: string, transaction: Transaction): Promise<DocenteEntity | null> {
		return this.docenteModel.findByPk(codigo, { transaction });
	}

	/**
	 * Usuário do docente: pelo `id_usuario` do docente; senão pelo ID UFFS (= código do
	 * docente); senão pelo e-mail.
	 */
	async buscarUsuarioDoDocente(docente: DocenteEntity, transaction: Transaction): Promise<UsuarioEntity | null> {
		const ids = [docente.id_usuario, docente.codigo].filter((id): id is string => Boolean(id));
		for (const id of ids) {
			const usuario = await this.usuarioModel.findByPk(id, { transaction });
			if (usuario) return usuario;
		}
		if (!docente.email) return null;
		return this.usuarioModel.findOne({ where: { email: docente.email }, transaction });
	}

	async criarUsuario(dados: { id: string; nome: string | null; email: string | null }, transaction: Transaction): Promise<UsuarioEntity> {
		return this.usuarioModel.create(dados, { transaction });
	}

	async vincularDocenteAoUsuario(docente: DocenteEntity, idUsuario: string, transaction: Transaction): Promise<void> {
		if (docente.id_usuario) return;
		await docente.update({ id_usuario: idUsuario }, { transaction });
	}

	async garantirGrupo(idUsuario: string, idGrupo: number, transaction: Transaction): Promise<void> {
		await this.usuarioGrupoModel.findOrCreate({
			where: { id_usuario: idUsuario, id_grupo: idGrupo },
			defaults: { id_usuario: idUsuario, id_grupo: idGrupo },
			transaction,
		});
	}

	async garantirCurso(idUsuario: string, idCurso: number, transaction: Transaction): Promise<void> {
		await this.usuarioCursoModel.findOrCreate({
			where: { id_usuario: idUsuario, id_curso: idCurso },
			defaults: { id_usuario: idUsuario, id_curso: idCurso },
			transaction,
		});
	}

	async deletarOrientacao(idCurso: number, codigoDocente: string, transaction: Transaction): Promise<boolean> {
		const deleted = await this.orientadorCursoModel.destroy({
			where: { id_curso: idCurso, codigo_docente: codigoDocente },
			transaction,
		});
		return deleted > 0;
	}

	/**
	 * Orientações (como orientador ou coorientador, em qualquer curso) cujo TCC é do
	 * período informado ou de um período posterior.
	 */
	async contarOrientacoesAtivas(
		codigoDocente: string,
		ano: number,
		semestre: number,
		transaction: Transaction,
	): Promise<number> {
		return this.orientacaoModel.count({
			where: { codigo_docente: codigoDocente },
			include: [
				{
					model: TrabalhoConclusaoEntity,
					as: "trabalhoConclusao",
					attributes: [],
					required: true,
					where: { [Op.or]: [{ ano: { [Op.gt]: ano } }, { ano, semestre: { [Op.gte]: semestre } }] },
				},
			],
			transaction,
		});
	}

	/** Cursos em que o docente continua orientador, exceto o informado. */
	async buscarOutrosCursosDoOrientador(codigoDocente: string, idCursoExcluir: number, transaction: Transaction): Promise<OrientadorCursoEntity[]> {
		return this.orientadorCursoModel.findAll({
			where: { codigo_docente: codigoDocente, id_curso: { [Op.ne]: idCursoExcluir } },
			include: [{ model: CursoEntity, as: "curso", attributes: ["id", "nome", "codigo"] }],
			transaction,
		});
	}

	async removerGrupo(idUsuario: string, idGrupo: number, transaction: Transaction): Promise<void> {
		await this.usuarioGrupoModel.destroy({ where: { id_usuario: idUsuario, id_grupo: idGrupo }, transaction });
	}
}
