import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { DicenteEntity, GrupoEntity, PermissaoEntity, TrabalhoConclusaoEntity } from "../database/entities";
import { PermissoesRepository } from "./permissoes.repository";

export interface PermissaoConsolidada {
	id: number;
	nome: unknown;
	descricao: string | null;
	leitura: boolean;
	edicao: boolean;
	grupos: { id: number; nome: string }[];
}

@Injectable()
export class PermissoesService {
	constructor(
		private readonly permissoesRepository: PermissoesRepository,
		@InjectModel(DicenteEntity) private readonly dicenteModel: typeof DicenteEntity,
		@InjectModel(TrabalhoConclusaoEntity) private readonly tccModel: typeof TrabalhoConclusaoEntity,
	) {}

	async buscarPermissoesDoUsuario(userId: string): Promise<PermissaoConsolidada[]> {
		const usuario = await this.permissoesRepository.buscarUsuarioComGruposEPermissoes(userId);

		if (!usuario) {
			throw new Error("Usuário não encontrado");
		}

		const permissoesConsolidadas = new Map<number, PermissaoConsolidada>();

		const grupos = (usuario.get("grupos") as GrupoEntity[] | undefined) ?? [];
		for (const grupo of grupos) {
			const permissoes = (grupo.get("permissoes") as PermissaoEntity[] | undefined) ?? [];
			for (const permissao of permissoes) {
				const permissaoId = permissao.id;

				if (!permissoesConsolidadas.has(permissaoId)) {
					permissoesConsolidadas.set(permissaoId, {
						id: permissao.id,
						nome: (permissao as unknown as { nome?: unknown }).nome,
						descricao: permissao.descricao,
						leitura: true,
						edicao: true,
						grupos: [],
					});
				}

				const permissaoConsolidada = permissoesConsolidadas.get(permissaoId)!;

				if (!permissaoConsolidada.grupos.find((g) => g.id === grupo.id)) {
					permissaoConsolidada.grupos.push({ id: grupo.id, nome: grupo.nome });
				}
			}
		}

		return Array.from(permissoesConsolidadas.values());
	}

	async verificarPermissao(userId: string, nomePermissao: string, acao: "leitura" | "edicao" = "leitura"): Promise<boolean> {
		try {
			const permissoes = await this.buscarPermissoesDoUsuario(userId);
			const permissao = permissoes.find((p) => p.nome === nomePermissao);

			if (!permissao) {
				return false;
			}

			return permissao[acao] === true;
		} catch {
			return false;
		}
	}

	async verificarConsultaTodos(userId: string): Promise<boolean> {
		const usuario = await this.permissoesRepository.buscarUsuarioComGrupos(userId);

		if (!usuario) {
			return false;
		}

		const grupos = (usuario.get("grupos") as GrupoEntity[] | undefined) ?? [];
		return grupos.length > 0;
	}

	async buscarGruposDoUsuario(userId: string): Promise<GrupoEntity[]> {
		const usuario = await this.permissoesRepository.buscarUsuarioComGrupos(userId);

		if (!usuario) {
			throw new Error("Usuário não encontrado");
		}

		return (usuario.get("grupos") as GrupoEntity[] | undefined) ?? [];
	}

	async buscarTodasPermissoes(): Promise<PermissaoEntity[]> {
		return this.permissoesRepository.buscarTodasPermissoes();
	}

	async buscarTodosGrupos(): Promise<GrupoEntity[]> {
		return this.permissoesRepository.buscarTodosGrupos();
	}

	/** Retorna a matrícula do discente vinculado ao userId, ou null se não for discente. */
	async buscarMatriculaDoUsuario(userId: string): Promise<string | null> {
		const dicente = await this.dicenteModel.findOne({
			where: { id_usuario: userId },
			attributes: ["matricula"],
		});
		return dicente?.matricula ?? null;
	}

	/** Verifica se o usuário possui uma permissão específica pelo seu ID numérico. */
	async usuarioTemPermissaoId(userId: string, permissaoId: number): Promise<boolean> {
		const permissoes = await this.buscarPermissoesDoUsuario(userId);
		return permissoes.some((p) => p.id === permissaoId);
	}

	/** Retorna o id do TCC mais recente da matrícula informada, ou null se não houver. */
	async buscarIdTccPorMatricula(matricula: string): Promise<number | null> {
		const tcc = await this.tccModel.findOne({
			where: { matricula },
			order: [
				["ano", "DESC"],
				["semestre", "DESC"],
				["id", "DESC"],
			],
			attributes: ["id"],
		});
		return tcc?.id ?? null;
	}

	/** Verifica se o TCC com o id fornecido pertence ao discente com a matrícula informada. */
	async verificarPropriedadeTcc(idTcc: number, matricula: string): Promise<boolean> {
		const tcc = await this.tccModel.findOne({
			where: { id: idTcc, matricula },
			attributes: ["id"],
		});
		return tcc !== null;
	}
}
