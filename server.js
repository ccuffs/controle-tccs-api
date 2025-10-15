require("module-alias/register");
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const app = express();
const docentesController = require("./src/controllers/docentes-controller");
const cursosController = require("./src/controllers/cursos-controller");
const usuariosController = require("./src/controllers/usuarios-controller");
const orientadoresController = require("./src/controllers/orientadores-controller");
const bancaCursoController = require("./src/controllers/banca-curso-controller");
const orientacoesController = require("./src/controllers/orientacoes-controller");
const dicentesController = require("./src/controllers/dicentes-controller");
const ofertasTccController = require("./src/controllers/ofertas-tcc-controller");
const areaTccController = require("./src/controllers/area-tcc-controller");
const temaTccController = require("./src/controllers/tema-tcc-controller");
const trabalhoConclusaoController = require("./src/controllers/trabalho-conclusao-controller");
const conviteController = require("./src/controllers/convite-controller");
const authController = require("./src/controllers/auth-controller");
const datasDefesaController = require("./src/controllers/datas-defesa-controller");
const disponibilidadeBancaController = require("./src/controllers/disponibilidade-banca-controller");
const defesaController = require("./src/controllers/defesa-controller");
const anoSemestreController = require("./src/controllers/ano-semestre-controller");
const dashboardController = require("./src/controllers/dashboard-controller");
const declaracoesController = require("./src/controllers/declaracoes-controller");

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
app.use("/api/auth", authController);

// Rotas da API
app.use("/api/docentes", docentesController);
app.use("/api/cursos", cursosController);
app.use("/api/usuarios", usuariosController);
app.use("/api/orientadores", orientadoresController);
app.use("/api/banca-curso", bancaCursoController);
app.use("/api/orientacoes", orientacoesController);
app.use("/api/dicentes", dicentesController);
app.use("/api/ofertas-tcc", ofertasTccController);
app.use("/api/areas-tcc", areaTccController);
app.use("/api/temas-tcc", temaTccController);
app.use("/api/trabalho-conclusao", trabalhoConclusaoController);
app.use("/api/convites", conviteController);
app.use("/api/datas-defesa", datasDefesaController);
app.use("/api/disponibilidade-banca", disponibilidadeBancaController);
app.use("/api/defesas", defesaController);
app.use("/api/ano-semestre", anoSemestreController);
app.use("/api/dashboard", dashboardController);
app.use("/api/declaracoes", declaracoesController);
