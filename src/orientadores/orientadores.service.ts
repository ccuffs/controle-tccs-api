import { ConflictException, Injectable, NotFoundException, UnprocessableEntityException } from "@nestjs/common";
import { InjectConnection } from "@nestjs/sequelize";
import { Sequelize } from "sequelize";
import { AnoSemestreService } from "../ano-semestre/ano-semestre.service";
import { OrientadorCursoEntity } from "../database/entities";
import { Permissoes } from "../permissoes/permissoes.enum";
import { CriarOrientadorDto } from "./dto/criar-orientador.dto";
import { OrientadoresRepository } from "./orientadores.repository";

@Injectable()
export class OrientadoresService {
	constructor(
		private readonly orientadoresRepository: OrientadoresRepository,
		private readonly anoSemestreService: AnoSemestreService,
		@InjectConnection() private readonly sequelize: Sequelize,
	) {}

	obterTodasOrientacoes(): Promise<OrientadorCursoEntity[]> {
		return this.orientadoresRepository.obterTodasOrientacoes();
	}

	obterOrientacoesPorDocente(codigo: string): Promise<OrientadorCursoEntity[]> {
		return this.orientadoresRepository.obterOrientacoesPorDocente(codigo);
	}

	obterOrientacoesPorCurso(id: number): Promise<OrientadorCursoEntity[]> {
		return this.orientadoresRepository.obterOrientacoesPorCurso(id);
	}

	/**
	 * Vincula o docente como orientador do curso e, na mesma transação, garante as
	 * permissões no usuário dele: grupo ORIENTADOR e o curso em `usuario_curso`.
	 * Se o docente ainda não tem usuário, cria um com o ID UFFS (= código do docente)
	 * para que ele entre no sistema já com o grupo.
	 */
	async criarOrientacao(dados: CriarOrientadorDto): Promise<OrientadorCursoEntity> {
		return this.sequelize.transaction(async (transaction) => {
			const repo = this.orientadoresRepository;
			const docente = await repo.buscarDocente(dados.codigo_docente, transaction);
			if (!docente) {
				throw new NotFoundException({ message: "Docente não encontrado" });
			}
			if (docente.externo) {
				throw new UnprocessableEntityException({ message: "Docentes externos não podem ser orientadores" });
			}

			const orientacao = await repo.criarOrientacao(dados.id_curso, docente.codigo, transaction);

			const usuario =
				(await repo.buscarUsuarioDoDocente(docente, transaction)) ??
				(await repo.criarUsuario({ id: docente.codigo, nome: docente.nome, email: docente.email }, transaction));

			await repo.vincularDocenteAoUsuario(docente, usuario.id, transaction);
			await repo.garantirGrupo(usuario.id, Permissoes.GRUPOS.ORIENTADOR, transaction);
			await repo.garantirCurso(usuario.id, dados.id_curso, transaction);

			return orientacao;
		});
	}

	/**
	 * Remove o vínculo orientador × curso. Com `removerGrupo`, tira também o grupo
	 * ORIENTADOR do usuário do docente — recusado (nada é removido) se ele tiver
	 * orientação ativa (TCC do período atual ou posterior) ou ainda orientar em outro curso.
	 */
	async deletarOrientacao(idCurso: number, codigoDocente: string, removerGrupo = false): Promise<boolean> {
		const { ano, semestre } = removerGrupo
			? await this.anoSemestreService.calcularAnoSemestreAtual()
			: { ano: 0, semestre: 0 };

		return this.sequelize.transaction(async (transaction) => {
			const repo = this.orientadoresRepository;
			const docente = removerGrupo ? await repo.buscarDocente(codigoDocente, transaction) : null;

			if (docente) {
				const nome = docente.nome ?? docente.codigo;
				const ativas = await repo.contarOrientacoesAtivas(docente.codigo, ano, semestre, transaction);
				if (ativas > 0) {
					throw new ConflictException({
						message: `${nome} tem ${ativas} ${ativas === 1 ? "orientação ativa" : "orientações ativas"} (${ano}/${semestre} ou posterior). O grupo de orientador não pode ser removido enquanto houver orientações ativas.`,
					});
				}
				const outros = await repo.buscarOutrosCursosDoOrientador(docente.codigo, idCurso, transaction);
				if (outros.length > 0) {
					const cursos = outros.map((o) => o.curso?.nome ?? `curso ${o.id_curso}`).join(", ");
					throw new ConflictException({
						message: `${nome} ainda é orientador em ${cursos}. O grupo de orientador só pode ser removido junto com o último vínculo.`,
					});
				}
			}

			const removido = await repo.deletarOrientacao(idCurso, codigoDocente, transaction);
			if (removido && docente) {
				const usuario = await repo.buscarUsuarioDoDocente(docente, transaction);
				if (usuario) await repo.removerGrupo(usuario.id, Permissoes.GRUPOS.ORIENTADOR, transaction);
			}
			return removido;
		});
	}
}
