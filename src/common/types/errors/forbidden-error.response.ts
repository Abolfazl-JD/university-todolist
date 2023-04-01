import { AbstractErrorResponse } from "./abstract-error.response";

export class ForbiddenErrorResponse extends AbstractErrorResponse {
    /**
     * @example 403
     */
    statusCode: number;

    /**
     * @example Forbidden
     */
    error: string;
}