import { HttpStatus } from "../extension/httpstatus.exception";

export default class MyException extends Error {
    public statusCode: number;
    constructor(message: string) {
        super();
        this.message = message
        this.statusCode = HttpStatus.BAD_REQUEST
    }
    public withExceptionCode(statusCode: HttpStatus) {
        this.statusCode = statusCode
        return this
    }
}