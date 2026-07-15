import { SetMetadata } from "@nestjs/common";

export const PERMISSOES_KEY = "permissoes";

/** Porta autorizacao.js `verificarPermissao`: libera se o usuário tiver QUALQUER uma das permissões informadas. */
export const RequerPermissao = (...permissaoIds: number[]) => SetMetadata(PERMISSOES_KEY, permissaoIds);
