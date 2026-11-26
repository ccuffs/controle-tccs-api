import { HttpException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { DocenteEntity } from "../database/entities";
import { Permissoes } from "../permissoes/permissoes.enum";
import { PermissoesService } from "../permissoes/permissoes.service";
import { FiltrosDashboardDto } from "./dto/filtros-dashboard.dto";

/**
 * Restringe os filtros do dashboard ao docente logado quando o usuário não é
 * coordenação (ADMIN ou PROFESSOR_CCR): orientadores, professores e membros de
 * banca só enxergam os próprios dados, qualquer que seja o `codigo_docente` enviado.
 */
@Injectable()
export class EscopoDocenteService {
	constructor(
		private readonly permissoesService: PermissoesService,
		@InjectModel(DocenteEntity)
		private readonly docenteModel: typeof DocenteEntity,
	) {}

	async aplicar(idUsuario: string, filtros: FiltrosDashboardDto): Promise<FiltrosDashboardDto> {
		const grupos = await this.permissoesService.buscarGruposDoUsuario(idUsuario);
		const coordenacao = grupos.some(
			(g) => g.id === Permissoes.GRUPOS.ADMIN || g.id === Permissoes.GRUPOS.PROFESSOR_CCR,
		);
		if (coordenacao) return filtros;

		const docente = await this.docenteModel.findOne({ attributes: ["codigo"], where: { id_usuario: idUsuario } });
		if (!docente) {
			throw new HttpException({ message: "Usuário não está vinculado a um docente" }, 403);
		}
		return { ...filtros, codigo_docente: docente.codigo };
	}
}
