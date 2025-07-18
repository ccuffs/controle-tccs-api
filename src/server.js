require("module-alias/register");
require('dotenv').config({ path: '../.env' })

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");


const app = express();
const docentesController = require("./controllers/docentes-controller");
const cursosController = require("./controllers/cursos-controller");
const usuariosController = require("./controllers/usuarios-controller");
const orientadoresController = require("./controllers/orientadores-controller");
const dicentesController = require("./controllers/dicentes-controller");

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname + "/public"));
app.use(helmet());
app.use(morgan("combined"));


app.listen(3010, () => console.log("Servidor rodando na porta 3010."));

app.get("/", (req, res) => {
	res.send("Hello, world!");
});

app.use("/api/docentes", docentesController);
app.use("/api/cursos", cursosController);
app.use("/api/usuarios", usuariosController);
app.use("/api/orientadores", orientadoresController);
app.use("/api/dicentes", dicentesController);