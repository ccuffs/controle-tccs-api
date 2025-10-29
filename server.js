require("module-alias/register");
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const app = express();
const docentesResource = require("./src/resources/docentes-resource");
const cursosResource = require("./src/resources/cursos-resource");
const usuariosResource = require("./src/resources/usuarios-resource");
const orientadoresResource = require("./src/resources/orientadores-resource");
const bancaCursoResource = require("./src/resources/banca-curso-resource");
const orientacoesResource = require("./src/resources/orientacoes-resource");
const dicentesResource = require("./src/resources/dicentes-resource");
const ofertasTccResource = require("./src/resources/ofertas-tcc-resource");
const areaTccResource = require("./src/resources/area-tcc-resource");
const temaTccResource = require("./src/resources/tema-tcc-resource");
const trabalhoConclusaoResource = require("./src/resources/trabalho-conclusao-resource");
const conviteResource = require("./src/resources/convite-resource");
const authResource = require("./src/resources/auth-resource");
const datasDefesaResource = require("./src/resources/datas-defesa-resource");
const disponibilidadeBancaResource = require("./src/resources/disponibilidade-banca-resource");
const defesaResource = require("./src/resources/defesa-resource");
const anoSemestreResource = require("./src/resources/ano-semestre-resource");
const dashboardResource = require("./src/resources/dashboard-resource");
const declaracoesResource = require("./src/resources/declaracoes-resource");

const port = process.env.SERVERPORT || 3010;

// Configuração do Passport para autenticação JWT
const { passport } = require("./src/middleware/auth");

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname + "/public"));
app.use(helmet());
app.use(morgan("combined"));

// Inicializar Passport
app.use(passport.initialize());

app.listen(port, () => console.log(`Servidor rodando na porta ${port}.`));

app.get("/", (req, res) => {
	res.send("Hello, world!");
});

// Rotas de autenticação
app.use("/api/auth", authResource);

// Rotas da API
app.use("/api/docentes", docentesResource);
app.use("/api/cursos", cursosResource);
app.use("/api/usuarios", usuariosResource);
app.use("/api/orientadores", orientadoresResource);
app.use("/api/banca-curso", bancaCursoResource);
app.use("/api/orientacoes", orientacoesResource);
app.use("/api/dicentes", dicentesResource);
app.use("/api/ofertas-tcc", ofertasTccResource);
app.use("/api/areas-tcc", areaTccResource);
app.use("/api/temas-tcc", temaTccResource);
app.use("/api/trabalho-conclusao", trabalhoConclusaoResource);
app.use("/api/convites", conviteResource);
app.use("/api/datas-defesa", datasDefesaResource);
app.use("/api/disponibilidade-banca", disponibilidadeBancaResource);
app.use("/api/defesas", defesaResource);
app.use("/api/ano-semestre", anoSemestreResource);
app.use("/api/dashboard", dashboardResource);
app.use("/api/declaracoes", declaracoesResource);
