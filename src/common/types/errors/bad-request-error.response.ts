import { ApiProperty } from "@nestjs/swagger";
import { AbstractErrorResponse } from "./abstract-error.response";

export class BadRequestErrorResponse extends AbstractErrorResponse {
    @ApiProperty({ example: 400 })
    statusCode: number;

    /**
     * @example 'Bad request'
     */
    error: string
}