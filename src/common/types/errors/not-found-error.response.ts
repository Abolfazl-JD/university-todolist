import { AbstractErrorResponse } from "./abstract-error.response";

export class NotFoundErrorResponse extends AbstractErrorResponse {
    /**
     *@example 404
     */
    statusCode: number;

    /**
     * @example 'Not Found'
     */
    error: string;
}