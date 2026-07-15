import { SetMetadata } from "@nestjs/common";

export const GRUPOS_KEY = "grupos";

/** Porta autorizacao.js `verificarPermissaoGrupo`: libera se o usuário pertencer a QUALQUER um dos grupos informados. */
export const RequerGrupo = (...grupoIds: number[]) => SetMetadata(GRUPOS_KEY, grupoIds);
