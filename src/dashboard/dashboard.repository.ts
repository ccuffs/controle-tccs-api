import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { col, fn, literal, Includeable, WhereOptions } from "sequelize";
import {
	AnoSemestreEntity,
	BancaCursoEntity,
	ConviteEntity,
	DefesaEntity,
	DocenteDisponibilidadeBancaEntity,
	OrientacaoEntity,
	OrientadorCursoEntity,
	TrabalhoConclusaoEntity,
} from "../database/entities";

@Injectable()
export class DashboardRepository {
	constructor(
		@InjectModel(TrabalhoConclusaoEntity)
		private readonly trabalhoConclusaoModel: typeof TrabalhoConclusaoEntity,
		@InjectModel(AnoSemestreEntity)
		private readonly anoSemestreModel: typeof AnoSemestreEntity,
		@InjectModel(ConviteEntity)
		private readonly conviteModel: typeof ConviteEntity,
		@InjectModel(OrientadorCursoEntity)
		private readonly orientadorCursoModel: typeof OrientadorCursoEntity,
		@InjectModel(OrientacaoEntity)
		private readonly orientacaoModel: typeof OrientacaoEntity,
		@InjectModel(DefesaEntity)
		private readonly defesaModel: typeof DefesaEntity,
		@InjectModel(DocenteDisponibilidadeBancaEntity)
		private readonly disponibilidadeModel: typeof DocenteDisponibilidadeBancaEntity,
		@InjectModel(BancaCursoEntity)
		private readonly bancaCursoModel: typeof BancaCursoEntity,
	) {}

	contarTccsNaOferta(where: WhereOptions): Promise<number> {
		return this.trabalhoConclusaoModel.count({ where });
	}

	contarTccsComOrientador(where: WhereOptions, include: Includeable[]): Promise<number> {
		return this.trabalhoConclusaoModel.count({ where, include, distinct: true });
	}

	buscarDistribuicaoPorEtapa(
		where: WhereOptions,
		include: Includeable[],
		group: string[],
		order: [string, string][],
	): Promise<Record<string, unknown>[]> {
		return this.trabalhoConclusaoModel.findAll({
			attributes: ["etapa", [fn("COUNT", col("TrabalhoConclusao.id")), "quantidade"]],
			where,
			include,
			group,
			order,
			raw: true,
		}) as unknown as Promise<Record<string, unknown>[]>;
	}

	buscarPeriodoSemestre(ano: number, semestre: number): Promise<Record<string, unknown> | null> {
		return this.anoSemestreModel.findOne({ where: { ano, semestre }, raw: true }) as unknown as Promise<
			Record<string, unknown> | null
		>;
	}

	buscarConvitesPorPeriodo(where: WhereOptions, include: Includeable[]): Promise<Record<string, unknown>[]> {
		return this.conviteModel.findAll({
			attributes: ["data_envio", "orientacao"],
			where,
			include,
			raw: true,
		}) as unknown as Promise<Record<string, unknown>[]>;
	}

	private statusAggregate(where: WhereOptions, include: Includeable[]) {
		return this.conviteModel.findAll({
			attributes: [
				[fn("SUM", literal('CASE WHEN "Convite"."data_feedback" IS NOT NULL THEN 1 ELSE 0 END')), "respondidos"],
				[fn("SUM", literal('CASE WHEN "Convite"."data_feedback" IS NULL THEN 1 ELSE 0 END')), "pendentes"],
				[fn("COUNT", col("Convite.id_tcc")), "total"],
			],
			where,
			include,
			raw: true,
		}) as unknown as Promise<Record<string, unknown>[]>;
	}

	buscarConvitesOrientacaoStatus(where: WhereOptions, include: Includeable[]) {
		return this.statusAggregate(where, include);
	}

	buscarConvitesBancaStatus(where: WhereOptions, include: Includeable[]) {
		return this.statusAggregate(where, include);
	}

	buscarOrientadoresCurso(where: WhereOptions, include: Includeable[]): Promise<Record<string, unknown>[]> {
		return this.orientadorCursoModel.findAll({ where, include, raw: true, nest: true }) as unknown as Promise<
			Record<string, unknown>[]
		>;
	}

	contarOrientandosPorDocente(where: WhereOptions, include: Includeable[], group: string[]): Promise<Record<string, unknown>[]> {
		return this.orientacaoModel.findAll({
			attributes: ["codigo_docente", [fn("COUNT", fn("DISTINCT", col("Orientacao.id_tcc"))), "quantidade"]],
			where: { orientador: true, ...(where as object) },
			include,
			group,
			raw: true,
		}) as unknown as Promise<Record<string, unknown>[]>;
	}

	contarDefesasAceitasPorDocente(where: WhereOptions, include: Includeable[], group: string[]): Promise<Record<string, unknown>[]> {
		return this.conviteModel.findAll({
			attributes: [
				"codigo_docente",
				[literal('COUNT(DISTINCT ("Convite"."id_tcc", "Convite"."fase"))'), "quantidade"],
			],
			where,
			include,
			group,
			raw: true,
		}) as unknown as Promise<Record<string, unknown>[]>;
	}

	buscarDefesasAgendadas(where: WhereOptions, include: Includeable[]): Promise<Record<string, unknown>[]> {
		return this.defesaModel.findAll({ where, include, raw: true, nest: true }) as unknown as Promise<
			Record<string, unknown>[]
		>;
	}

	buscarIdsTccsComConviteBanca(where: WhereOptions, include: Includeable[]): Promise<{ id_tcc: number }[]> {
		return this.conviteModel.findAll({ attributes: ["id_tcc"], where, include, raw: true }) as unknown as Promise<
			{ id_tcc: number }[]
		>;
	}

	buscarCodigosDocentesComConviteBanca(where: WhereOptions, include: Includeable[]): Promise<{ codigo_docente: string }[]> {
		return this.conviteModel.findAll({
			attributes: [[fn("DISTINCT", col("Convite.codigo_docente")), "codigo_docente"]],
			where,
			include,
			raw: true,
		}) as unknown as Promise<{ codigo_docente: string }[]>;
	}

	buscarEstudantesSemConviteBanca(where: WhereOptions, include: Includeable[]): Promise<TrabalhoConclusaoEntity[]> {
		// `distinct: true` no legado não tem efeito real em findAll (só existe em
		// count/findAndCountAll) — omitido aqui, mesmo comportamento observável.
		return this.trabalhoConclusaoModel.findAll({
			attributes: ["id", "matricula", "fase", "id_curso", "ano", "semestre"],
			where,
			include,
			subQuery: false,
		});
	}

	buscarCodigosDocentesComDisponibilidade(where: WhereOptions): Promise<{ codigo_docente: string }[]> {
		return this.disponibilidadeModel.findAll({
			attributes: [[fn("DISTINCT", col("codigo_docente")), "codigo_docente"]],
			where,
			raw: true,
		}) as unknown as Promise<{ codigo_docente: string }[]>;
	}

	buscarDocentesBancaCurso(where: WhereOptions, include: Includeable[]): Promise<Record<string, unknown>[]> {
		return this.bancaCursoModel.findAll({ where, include, raw: true, nest: true }) as unknown as Promise<
			Record<string, unknown>[]
		>;
	}
}
