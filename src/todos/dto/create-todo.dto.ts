import { ApiProperty } from "@nestjs/swagger"
import { IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator"

export class CreateTodoDto {
    /**
     * work to do
     * @example Cooking
    */
    @IsString()
    @IsNotEmpty()
    @MinLength(2)
    task: string

    /**
     * Additional information about the task
     * @example 'after having breakfast'
    */
    @IsString()
    @IsOptional()
    @MinLength(2)
    description: string
}