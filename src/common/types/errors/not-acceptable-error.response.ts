import { AbstractErrorResponse } from "./abstract-error.response";

export class NotAcceptableErrorResponse extends AbstractErrorResponse {
    /**
     * @example 406
     */
    statusCode: number;

    /**
     *@example 'Not acceptable'
     */
    error: string;
}