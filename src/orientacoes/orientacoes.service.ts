import { HttpException, Injectable } from "@nestjs/common";
import { OrientacaoEntity } from "../database/entities";
import { AtualizarOrientacaoDto } from "./dto/atualizar-orientacao.dto";
import { CriarOrientacaoDto } from "./dto/criar-orientacao.dto";
import { FiltrosOrientacoes, OrientacoesRepository } from "./orientacoes.repository";

@Injectable()
export class OrientacoesService {
	constructor(private readonly orientacoesRepository: OrientacoesRepository) {}

	obterTodasOrientacoes(filtros: FiltrosOrientacoes): Promise<OrientacaoEntity[]> {
		return this.orientacoesRepository.obterTodasOrientacoes(filtros);
	}

	async criarOrientacao(dados: CriarOrientacaoDto): Promise<OrientacaoEntity> {
		const orientacaoExiste = await this.orientacoesRepository.verificarOrientacaoExiste(
			dados.codigo_docente,
			dados.id_tcc,
		);

		if (orientacaoExiste) {
			throw new HttpException({ message: "Este docente já possui orientação para este TCC" }, 400);
		}

		if (dados.orientador) {
			const orientadorExiste = await this.orientacoesRepository.verificarOrientadorExiste(dados.id_tcc);

			if (orientadorExiste) {
				throw new HttpException({ message: "Este TCC já possui um orientador principal" }, 400);
			}
		}

		return this.orientacoesRepository.criarOrientacao(dados);
	}

	/** Porta de `atualizaOrientacao`: o legado lia `req.params.id`, mas a rota é `PUT /`
	 * (sem `:id`), então esse id sempre vinha `undefined` e o endpoint nunca funcionava.
	 * Aqui uso `formData.id` (mesma convenção de docentes/cursos/areas-tcc), corrigindo
	 * o bug e mantendo o resto da lógica de negócio idêntica. */
	async atualizarOrientacao(dados: AtualizarOrientacaoDto): Promise<void> {
		if (dados.orientador) {
			const orientacaoAtual = await this.orientacoesRepository.obterOrientacaoPorId(dados.id);

			if (!orientacaoAtual) {
				throw new HttpException({ message: "Orientação não encontrada" }, 404);
			}

			if (!orientacaoAtual.orientador) {
				const outroOrientadorExiste = await this.orientacoesRepository.verificarOutroOrientadorExiste(
					orientacaoAtual.id_tcc,
					dados.id,
				);

				if (outroOrientadorExiste) {
					throw new HttpException({ message: "Este TCC já possui um orientador principal" }, 400);
				}
			}
		}

		const sucesso = await this.orientacoesRepository.atualizarOrientacao(dados.id, dados);

		if (!sucesso) {
			throw new HttpException({ message: "Orientação não encontrada" }, 404);
		}
	}

	deletarOrientacao(id: number): Promise<boolean> {
		return this.orientacoesRepository.deletarOrientacao(id);
	}
}
