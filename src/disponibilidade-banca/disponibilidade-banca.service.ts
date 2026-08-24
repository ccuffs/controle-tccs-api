import { HttpException, Injectable } from "@nestjs/common";
import { DatasDefesaRepository } from "../datas-defesa/datas-defesa.repository";
import { DocenteDisponibilidadeBancaEntity } from "../database/entities";
import {
	DadosDisponibilidade,
	DisponibilidadeBancaRepository,
	FiltrosDisponibilidade,
} from "./disponibilidade-banca.repository";

interface ItemSincronizacao extends Partial<DadosDisponibilidade> {
	disponivel?: boolean;
}

@Injectable()
export class DisponibilidadeBancaService {
	constructor(
		private readonly disponibilidadeBancaRepository: DisponibilidadeBancaRepository,
		private readonly datasDefesaRepository: DatasDefesaRepository,
	) {}

	/** Porta de `adicionarFlagDisponivel`: mantém compatibilidade com o front, que espera
	 * um campo `disponivel: true` em cada registro retornado (toda linha na tabela já
	 * representa, por definição, um horário marcado como disponível). */
	private comFlagDisponivel(item: DocenteDisponibilidadeBancaEntity): Record<string, unknown> {
		return { ...item.toJSON(), disponivel: true };
	}

	private adicionarFlagDisponivel(entrada: DocenteDisponibilidadeBancaEntity): Record<string, unknown>;
	private adicionarFlagDisponivel(entrada: DocenteDisponibilidadeBancaEntity[]): Record<string, unknown>[];
	private adicionarFlagDisponivel(entrada: null): null;
	private adicionarFlagDisponivel(
		entrada: DocenteDisponibilidadeBancaEntity | DocenteDisponibilidadeBancaEntity[] | null,
	): Record<string, unknown> | Record<string, unknown>[] | null {
		if (!entrada) {
			return null;
		}
		if (Array.isArray(entrada)) {
			return entrada.map((item) => this.comFlagDisponivel(item));
		}
		return this.comFlagDisponivel(entrada);
	}

	async obterTodasDisponibilidades(filtros: FiltrosDisponibilidade) {
		const disponibilidades = await this.disponibilidadeBancaRepository.obterTodasDisponibilidades(filtros);
		return this.adicionarFlagDisponivel(disponibilidades);
	}

	async obterDisponibilidade(
		ano: string,
		semestre: string,
		idCurso: string,
		fase: string,
		codigoDocente: string,
		dataDefesa: string,
		horaDefesa: string,
	) {
		const disponibilidade = await this.disponibilidadeBancaRepository.obterDisponibilidade(
			ano,
			semestre,
			idCurso,
			fase,
			codigoDocente,
			dataDefesa,
			horaDefesa,
		);

		if (!disponibilidade) {
			throw new HttpException({ message: "Disponibilidade não encontrada" }, 404);
		}

		return this.adicionarFlagDisponivel(disponibilidade);
	}

	async obterDisponibilidadesPorDocenteEOferta(codigoDocente: string, ano: string, semestre: string, idCurso: string, fase: string) {
		const disponibilidades = await this.disponibilidadeBancaRepository.obterDisponibilidadesPorDocenteEOferta(
			codigoDocente,
			ano,
			semestre,
			idCurso,
			fase,
		);
		return this.adicionarFlagDisponivel(disponibilidades);
	}

	private validarCamposObrigatorios(dados: Partial<DadosDisponibilidade>): asserts dados is DadosDisponibilidade {
		if (
			!dados.ano ||
			!dados.semestre ||
			!dados.id_curso ||
			!dados.fase ||
			!dados.codigo_docente ||
			!dados.data_defesa ||
			!dados.hora_defesa
		) {
			throw new HttpException({ message: "Todos os campos são obrigatórios" }, 400);
		}
	}

	async criarDisponibilidade(dadosDisponibilidade: Partial<DadosDisponibilidade>) {
		this.validarCamposObrigatorios(dadosDisponibilidade);
		const novaDisponibilidade = await this.disponibilidadeBancaRepository.criarDisponibilidade(dadosDisponibilidade);
		return this.adicionarFlagDisponivel(novaDisponibilidade);
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
		return this.disponibilidadeBancaRepository.atualizarDisponibilidade(
			ano,
			semestre,
			idCurso,
			fase,
			codigoDocente,
			dataDefesa,
			horaDefesa,
			dados,
		);
	}

	async criaOuAtualizaDisponibilidade(dadosDisponibilidade: Partial<DadosDisponibilidade>) {
		this.validarCamposObrigatorios(dadosDisponibilidade);
		const disponibilidade = await this.disponibilidadeBancaRepository.criarOuAtualizarDisponibilidade(dadosDisponibilidade);
		return this.adicionarFlagDisponivel(disponibilidade);
	}

	deletarDisponibilidade(
		ano: string,
		semestre: string,
		idCurso: string,
		fase: string,
		codigoDocente: string,
		dataDefesa: string,
		horaDefesa: string,
	): Promise<boolean> {
		return this.disponibilidadeBancaRepository.deletarDisponibilidade(
			ano,
			semestre,
			idCurso,
			fase,
			codigoDocente,
			dataDefesa,
			horaDefesa,
		);
	}

	async obterGradeDisponibilidade(codigoDocente: string, ano: string, semestre: string, idCurso: string, fase: string) {
		const datasDefesa = await this.datasDefesaRepository.obterDatasDefesaPorOferta(ano, semestre, idCurso, fase);

		if (!datasDefesa) {
			throw new HttpException({ message: "Datas de defesa não encontradas para esta oferta" }, 404);
		}

		const disponibilidades = await this.disponibilidadeBancaRepository.obterDisponibilidadesPorDocenteEOferta(
			codigoDocente,
			ano,
			semestre,
			idCurso,
			fase,
		);

		const horarios: string[] = [];
		const horaInicio = 13;
		const minutoInicio = 30;
		const horaFim = 21;
		const minutoFim = 30;

		for (let hora = horaInicio; hora <= horaFim; hora++) {
			for (let minuto = 0; minuto < 60; minuto += 30) {
				if (hora === horaInicio && minuto < minutoInicio) continue;
				if (hora === horaFim && minuto > minutoFim) continue;

				const horaStr = hora.toString().padStart(2, "0");
				const minutoStr = minuto.toString().padStart(2, "0");
				horarios.push(`${horaStr}:${minutoStr}:00`);
			}
		}

		const datas: string[] = [];
		if (datasDefesa.inicio && datasDefesa.fim) {
			const dataInicio = new Date(datasDefesa.inicio);
			const dataFim = new Date(datasDefesa.fim);

			for (const data = new Date(dataInicio); data <= dataFim; data.setDate(data.getDate() + 1)) {
				datas.push(new Date(data).toISOString().split("T")[0]);
			}
		}

		return {
			horarios,
			datas,
			disponibilidades: this.adicionarFlagDisponivel(disponibilidades),
			datasDefesa,
		};
	}

	async sincronizarDisponibilidades(disponibilidades: ItemSincronizacao[]) {
		if (!disponibilidades || !Array.isArray(disponibilidades)) {
			throw new HttpException({ message: "Lista de disponibilidades é obrigatória" }, 400);
		}

		const resultados: Record<string, unknown>[] = [];

		for (const dadosDisponibilidade of disponibilidades) {
			if (
				!dadosDisponibilidade.ano ||
				!dadosDisponibilidade.semestre ||
				!dadosDisponibilidade.id_curso ||
				!dadosDisponibilidade.fase ||
				!dadosDisponibilidade.codigo_docente ||
				!dadosDisponibilidade.data_defesa ||
				!dadosDisponibilidade.hora_defesa
			) {
				throw new HttpException({ message: "Todos os campos são obrigatórios para cada disponibilidade" }, 400);
			}

			try {
				if (dadosDisponibilidade.disponivel === true) {
					const { disponivel: _disponivel, ...payload } = dadosDisponibilidade;
					const disponibilidade = await this.disponibilidadeBancaRepository.criarOuAtualizarDisponibilidade(payload);
					resultados.push({
						success: true,
						data: dadosDisponibilidade.data_defesa,
						hora: dadosDisponibilidade.hora_defesa,
						disponibilidade: this.adicionarFlagDisponivel(disponibilidade),
					});
				} else if (dadosDisponibilidade.disponivel === false) {
					const deleted = await this.disponibilidadeBancaRepository.deletarDisponibilidade(
						dadosDisponibilidade.ano as string,
						dadosDisponibilidade.semestre as string,
						dadosDisponibilidade.id_curso as string,
						dadosDisponibilidade.fase as string,
						dadosDisponibilidade.codigo_docente,
						dadosDisponibilidade.data_defesa,
						dadosDisponibilidade.hora_defesa,
					);
					resultados.push({
						success: true,
						data: dadosDisponibilidade.data_defesa,
						hora: dadosDisponibilidade.hora_defesa,
						deleted,
					});
				} else {
					resultados.push({
						success: true,
						data: dadosDisponibilidade.data_defesa,
						hora: dadosDisponibilidade.hora_defesa,
						ignored: true,
					});
				}
			} catch (error) {
				resultados.push({
					success: false,
					data: dadosDisponibilidade.data_defesa,
					hora: dadosDisponibilidade.hora_defesa,
					error: (error as Error).message,
				});
			}
		}

		const sucessos = resultados.filter((r) => r.success).length;
		const falhas = resultados.filter((r) => !r.success).length;

		return {
			message: `Sincronização concluída: ${sucessos} sucessos, ${falhas} falhas`,
			resultados,
		};
	}
}
