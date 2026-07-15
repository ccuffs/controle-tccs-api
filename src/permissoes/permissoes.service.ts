import { Injectable } from "@nestjs/common";
import { GrupoEntity, PermissaoEntity } from "../database/entities";
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
	constructor(private readonly permissoesRepository: PermissoesRepository) {}

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
}
