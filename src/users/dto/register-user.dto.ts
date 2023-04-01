import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator"

export class RegisterUserDto {
    /**
     * @example ali
     */
    @IsNotEmpty()
    @IsString()
    @MinLength(2)
    username: string

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