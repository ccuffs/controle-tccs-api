const model = require("../models");
const { obterAnoSemestreAtual } = require("./ano-semestre-service");

/**
 * Conta quantos dicentes possuem orientador principal definido
 * para os filtros informados. Se ano/semestre não forem informados,
 * utiliza o período atual calculado por obterAnoSemestreAtual.
 *
 * Retorna também o total de dicentes na oferta para referência.
 */
const contarDicentesComOrientador = async (filtros) => {
  const { ano, semestre, id_curso, fase = 1 } = filtros || {};

  let anoAlvo = ano;
  let semestreAlvo = semestre;

  if (!anoAlvo || !semestreAlvo) {
    const atual = await obterAnoSemestreAtual();
    anoAlvo = atual.ano;
    semestreAlvo = atual.semestre;
  }

  // where base para a oferta
  const tccWhere = {
    ano: parseInt(anoAlvo),
    semestre: parseInt(semestreAlvo),
    fase: parseInt(fase),
  };

  if (id_curso) {
    tccWhere.id_curso = parseInt(id_curso);
  }

  // Total de TCCs na oferta
  const total = await model.TrabalhoConclusao.count({ where: tccWhere });

  // Contar TCCs que têm pelo menos uma orientação com orientador=true
  const comOrientador = await model.TrabalhoConclusao.count({
    where: tccWhere,
    include: [
      {
        model: model.Orientacao,
        required: true,
        where: { orientador: true },
      },
    ],
    distinct: true,
  });

  return {
    ano: anoAlvo,
    semestre: semestreAlvo,
    fase: parseInt(fase),
    id_curso: id_curso ? parseInt(id_curso) : undefined,
    total,
    comOrientador,
  };
};

module.exports = { contarDicentesComOrientador };

/**
 * Retorna distribuição de TCCs por etapa, considerando filtros.
 * Filtros: ano, semestre, id_curso (opcional), fase (default 1)
 */
const contarTccPorEtapa = async (filtros) => {
  const { ano, semestre, id_curso, fase = 1 } = filtros || {};

  let anoAlvo = ano;
  let semestreAlvo = semestre;

  if (!anoAlvo || !semestreAlvo) {
    const atual = await obterAnoSemestreAtual();
    anoAlvo = atual.ano;
    semestreAlvo = atual.semestre;
  }

  const where = {
    ano: parseInt(anoAlvo),
    semestre: parseInt(semestreAlvo),
    fase: parseInt(fase),
  };
  if (id_curso) where.id_curso = parseInt(id_curso);

  const resultados = await model.TrabalhoConclusao.findAll({
    attributes: [
      "etapa",
      [model.Sequelize.fn("COUNT", model.Sequelize.col("id")), "quantidade"],
    ],
    where,
    group: ["etapa"],
    order: [["etapa", "ASC"]],
    raw: true,
  });

  // Normaliza: etapa nula vira 0
  const distribuicao = resultados.map((r) => ({
    etapa: r.etapa === null ? 0 : parseInt(r.etapa),
    quantidade: parseInt(r.quantidade),
  }));

  return {
    ano: anoAlvo,
    semestre: semestreAlvo,
    fase: parseInt(fase),
    id_curso: id_curso ? parseInt(id_curso) : undefined,
    distribuicao,
  };
};

module.exports.contarTccPorEtapa = contarTccPorEtapa;


