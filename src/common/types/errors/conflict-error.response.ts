import { AbstractErrorResponse } from "./abstract-error.response";

export class ConflictErrorResponse extends AbstractErrorResponse {
    /**
     *@example 409
     */
    statusCode: number;

    /**
     * @example Conflict
     */
    error: string;
}