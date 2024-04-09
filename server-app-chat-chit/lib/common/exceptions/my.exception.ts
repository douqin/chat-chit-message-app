import {HttpException} from "./http.exeception";
import { HttpStatus } from "./httpstatus.exception";

export class MyException extends HttpException {
    constructor(message: string) {
        super(HttpStatus.BAD_REQUEST, message);
    }
    public withExceptionCode(statusCode: HttpStatus) {
        this.status = statusCode
        return this
    }
}