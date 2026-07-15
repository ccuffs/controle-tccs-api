import { Controller, Get } from "@nestjs/common";

@Controller()
export class AppController {
	@Get("/")
	raiz(): string {
		return "Hello, world!";
	}
}
