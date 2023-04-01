import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsOptional, IsString, MinLength } from "class-validator";

export class UpdateTodoDto {
    /**
     * work to do
     * @example Cooking
    */
    @IsOptional()
    @IsString()
    @MinLength(2)
    task?: string

    /**
     * Additional information about the task
     * @example 'after having breakfast'
    */
    @IsOptional()
    @IsString()
    @MinLength(2)
    description?: string

    /**
     * determine if task is done or not 
     * @example false
    */
    @IsOptional()
    @IsBoolean()
    done?: boolean
}