import { IsNotEmpty, IsString } from "class-validator";

export class EmailConfirmationDto {
    /**
     * token to verify email
    */
    @IsNotEmpty()
    @IsString()
    token: string
}