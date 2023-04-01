import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from "class-validator"

export class UpdateUserDto {

    /**
     * @example ali
     */
    @IsOptional()
    @IsString()
    username?: string

    /**
     * @xample ali@gmail.com
     */
    @IsOptional()
    @IsString()
    @IsEmail()
    email?: string

    /**
     * Old password (required if trying to change password)
     * @example oldpassword
     */
    @IsOptional()
    @IsString()
    @MinLength(6)
    @MaxLength(20)
    oldPassword?: string

    /**
     * new password to user
     * @example newpassword
     */
    @IsOptional()
    @IsString()
    @MinLength(6)
    @MaxLength(20)
    password?: string
}