// Precisa ser o primeiro import: módulos como AuthModule leem process.env.JWT_SECRET
// na própria definição (`JwtModule.register(...)`), avaliada em tempo de import — antes
// do ConfigModule.forRoot() rodar. Sem isso, o app assina tokens com o segredo padrão
// (hardcoded) e todo token real emitido depois falha na verificação ("invalid signature").
import "dotenv/config";
import "reflect-metadata";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import cors from "cors";
import helmet from "helmet";
import { join } from "path";
import { AppModule } from "./app.module";

async function bootstrap() {
	const app = await NestFactory.create<NestExpressApplication>(AppModule);

	app.use(cors());
	app.use(helmet());
	app.useStaticAssets(join(__dirname, "..", "src", "public"));

	app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
	app.setGlobalPrefix("api", { exclude: ["/"] });

	const port = process.env.SERVERPORT || 3010;
	await app.listen(port);
	console.log(`Servidor rodando na porta ${port}.`);
}

bootstrap();
