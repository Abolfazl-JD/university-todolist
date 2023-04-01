import { ApiProperty } from "@nestjs/swagger";
import { AbstractErrorResponse } from "./abstract-error.response";

export class UnauthorizedErrorResponse extends AbstractErrorResponse {
    /**
     * @example 401
     */
    statusCode: number;

    /**
     * @example Unauthorized
     */
    error: string;
}