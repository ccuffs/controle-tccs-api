import { HttpException, Injectable } from "@nestjs/common";
import { DocenteEntity } from "../database/entities";
import { Permissoes } from "../permissoes/permissoes.enum";
import { PermissoesService } from "../permissoes/permissoes.service";
import { AtualizarDocenteDto } from "./dto/atualizar-docente.dto";
import { CriarDocenteDto } from "./dto/criar-docente.dto";
import { DocentesRepository } from "./docentes.repository";

@Injectable()
export class DocentesService {
	constructor(
		private readonly docentesRepository: DocentesRepository,
		private readonly permissoesService: PermissoesService,
	) {}

	obterTodosDocentes(): Promise<DocenteEntity[]> {
		return this.docentesRepository.obterTodosDocentes();
	}

	criarDocente(dados: CriarDocenteDto): Promise<DocenteEntity> {
		return this.docentesRepository.criarDocente(dados);
	}

	obterDocentePorUsuario(idUsuario: string): Promise<DocenteEntity | null> {
		return this.docentesRepository.obterDocentePorUsuario(idUsuario);
	}

	buscarExternosPorNome(nome: string): Promise<DocenteEntity[]> {
		return this.docentesRepository.buscarExternosPorNome(nome);
	}

	deletarDocente(codigo: string): Promise<boolean> {
		return this.docentesRepository.deletarDocente(codigo);
	}

	/** Porta de docentes-service.js `atualizaDocente`: docente editando os próprios dados
	 * só pode alterar sala/siape; caso contrário exige a permissão DOCENTE.EDITAR. */
	async atualizarDocente(idUsuarioAutenticado: string, formData: AtualizarDocenteDto): Promise<boolean> {
		const docenteUsuario = await this.docentesRepository.obterDocentePorUsuario(idUsuarioAutenticado);

		if (docenteUsuario && docenteUsuario.codigo === formData.codigo) {
			const dadosPermitidos = { siape: formData.siape, sala: formData.sala };
			return this.docentesRepository.atualizarDocente(formData.codigo, dadosPermitidos);
		}

		const permissoesUsuario = await this.permissoesService.buscarPermissoesDoUsuario(idUsuarioAutenticado);
		const temPermissao = permissoesUsuario.some((permissao) => permissao.id === Permissoes.DOCENTE.EDITAR);

		if (!temPermissao) {
			throw new HttpException(
				{ message: "Permissão negada: você só pode editar seus próprios dados" },
				403,
			);
		}

		return this.docentesRepository.atualizarDocente(formData.codigo, formData);
	}
}
