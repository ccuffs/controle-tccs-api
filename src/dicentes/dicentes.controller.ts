import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpException,
	Param,
	Post,
	Put,
	Query,
	UploadedFile,
	UseGuards,
	UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import * as fs from "fs";
import { diskStorage } from "multer";
import { extname } from "path";
import { UsuarioAtual } from "../common/decorators/usuario-atual.decorator";
import { RequerPermissao } from "../common/decorators/permissoes.decorator";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { PermissoesGuard } from "../common/guards/permissoes.guard";
import { UsuarioEntity } from "../database/entities";
import { Permissoes } from "../permissoes/permissoes.enum";
import { AtualizarDicenteDto } from "./dto/atualizar-dicente.dto";
import { CriarDicenteDto } from "./dto/criar-dicente.dto";
import { DicentesService, OrientacaoDataPdf } from "./dicentes.service";
import { FiltrosTcc } from "./dicentes.repository";

const uploadPdfOptions = {
	storage: diskStorage({
		destination: (_req, _file, cb) => {
			const uploadDir = "uploads/temp";
			if (!fs.existsSync(uploadDir)) {
				fs.mkdirSync(uploadDir, { recursive: true });
			}
			cb(null, uploadDir);
		},
		filename: (_req, file, cb) => {
			const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
			cb(null, `${file.fieldname}-${uniqueSuffix}${extname(file.originalname)}`);
		},
	}),
	fileFilter: (_req: unknown, file: Express.Multer.File, cb: (error: Error | null, accept: boolean) => void) => {
		if (file.mimetype === "application/pdf") {
			cb(null, true);
		} else {
			cb(new Error("Apenas arquivos PDF são permitidos!"), false);
		}
	},
	limits: { fileSize: 10 * 1024 * 1024 },
};

/** Porta de src/resources/dicentes-resource.js + src/services/dicente-service.js. */
@Controller("dicentes")
export class DicentesController {
	constructor(private readonly dicentesService: DicentesService) {}

	@Get()
	@UseGuards(JwtAuthGuard, PermissoesGuard)
	@RequerPermissao(Permissoes.DICENTE.VISUALIZAR, Permissoes.DICENTE.VISUALIZAR_TODOS)
	async retornaTodosDicentes(@Query() query: FiltrosTcc) {
		const dicentes = await this.dicentesService.obterTodosDicentes(query);
		return { dicentes };
	}

	@Post()
	@HttpCode(200)
	@UseGuards(JwtAuthGuard, PermissoesGuard)
	@RequerPermissao(Permissoes.DICENTE.CRIAR)
	async criaDicente(@Body("formData") formData: CriarDicenteDto) {
		await this.dicentesService.criarDicente(formData);
		return { message: "Dicente criado com sucesso" };
	}

	@Put(":matricula")
	@UseGuards(JwtAuthGuard)
	async atualizaDicente(
		@Param("matricula") matricula: string,
		@UsuarioAtual() usuario: UsuarioEntity,
		@Body("formData") formData: AtualizarDicenteDto,
	) {
		await this.dicentesService.atualizarDicente(usuario.id as string, matricula, formData);
		return { message: "Dicente atualizado com sucesso" };
	}

	@Delete(":matricula")
	@HttpCode(200)
	@UseGuards(JwtAuthGuard, PermissoesGuard)
	@RequerPermissao(Permissoes.DICENTE.DELETAR)
	async deletaDicente(@Param("matricula") matricula: string) {
		try {
			const sucesso = await this.dicentesService.deletarDicente(matricula);

			if (!sucesso) {
				throw new HttpException({ message: "Dicente não encontrado" }, 404);
			}
		} catch (error) {
			if (error instanceof HttpException) {
				throw error;
			}
			throw new HttpException({ message: "Erro ao deletar dicente" }, 500);
		}
	}

	@Get("usuario/:id_usuario")
	@UseGuards(JwtAuthGuard, PermissoesGuard)
	@RequerPermissao(Permissoes.DICENTE.VISUALIZAR, Permissoes.DICENTE.VISUALIZAR_TODOS)
	async retornaDicentePorUsuarioAdmin(@Param("id_usuario") idUsuario: string) {
		const dicente = await this.dicentesService.obterDicentePorUsuario(idUsuario);

		if (!dicente) {
			throw new HttpException({ message: "Dicente não encontrado" }, 404);
		}

		return dicente;
	}

	@Get("meu-perfil")
	@UseGuards(JwtAuthGuard)
	async retornaDicentePorUsuario(@UsuarioAtual() usuario: UsuarioEntity) {
		const dicente = await this.dicentesService.obterDicentePorUsuario(usuario.id as string);

		if (!dicente) {
			throw new HttpException({ message: "Dicente não encontrado" }, 404);
		}

		return dicente;
	}

	// Guard de autenticação/permissão roda antes do FileInterceptor (Nest sempre executa
	// Guards antes de Interceptors), corrigindo a ordem invertida do multer legado
	// (upload.single("pdf") rodava antes de auth.autenticarUsuario em dicentes-resource.js).
	@Post("processar-pdf")
	@UseGuards(JwtAuthGuard, PermissoesGuard)
	@RequerPermissao(Permissoes.DICENTE.CRIAR)
	@UseInterceptors(FileInterceptor("pdf", uploadPdfOptions))
	async processarEInserirPDFDicentes(
		@UploadedFile() file: Express.Multer.File | undefined,
		@Body() body: { ano?: string; semestre?: string; fase?: string; id_curso?: string; codigo_docente?: string; orientador?: string | boolean },
	) {
		const caminhoArquivo = file?.path;
		const { ano, semestre, fase, id_curso, codigo_docente, orientador } = body;

		if (!caminhoArquivo) {
			throw new HttpException({ message: "Nenhum arquivo PDF fornecido" }, 400);
		}

		if (!ano || !semestre || !fase || !id_curso) {
			throw new HttpException(
				{ message: "Parâmetros obrigatórios não fornecidos: ano, semestre, fase e id_curso são necessários" },
				400,
			);
		}

		try {
			const dicentes = await this.dicentesService.processarPDFDicentes(caminhoArquivo);

			if (dicentes.length === 0) {
				throw new HttpException({ message: "Nenhum dicente encontrado no PDF" }, 400);
			}

			const orientacaoData: OrientacaoDataPdf = {
				ano: parseInt(ano, 10),
				semestre: parseInt(semestre, 10),
				fase: parseInt(fase, 10),
				id_curso: parseInt(id_curso, 10),
			};

			if (codigo_docente) {
				orientacaoData.codigo_docente = codigo_docente;
				orientacaoData.orientador = orientador === "true" || orientador === true;
			}

			const resultados = await this.dicentesService.inserirMultiplosDicentesComOrientacao(
				dicentes,
				orientacaoData,
			);

			fs.unlinkSync(caminhoArquivo);

			return {
				message: "PDF processado com sucesso",
				totalEncontrados: dicentes.length,
				sucessos: resultados.sucessos,
				erros: resultados.erros,
				detalhes: resultados.detalhes,
				orientacoesIncluidas: !!codigo_docente,
			};
		} catch (error) {
			try {
				fs.unlinkSync(caminhoArquivo);
			} catch {
				// arquivo já removido/inacessível, ignora igual ao legado
			}

			if (error instanceof HttpException) {
				throw error;
			}

			throw new HttpException(
				{ message: "Erro interno do servidor ao processar PDF", erro: (error as Error).message },
				500,
			);
		}
	}
}
