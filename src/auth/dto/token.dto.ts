import { IsOptional, IsString } from "class-validator";

export class TokenDto {
	@IsOptional()
	@IsString()
	token?: string;
}
