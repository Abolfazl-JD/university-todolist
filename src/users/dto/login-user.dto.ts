import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator"

export class LoginUserDto {
    /**
     *@example ali@gmail.com
    */
    @IsNotEmpty()
    @IsString()
    @IsEmail()
    email: string

    /**
     *@example password
     */
    @IsNotEmpty()
    @IsString()
    @MinLength(6)
    @MaxLength(20)
    password: string
}