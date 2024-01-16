import { HttpStatus } from "../extension/httpstatus.exception";
import HttpException from "./http.exeception";

export default class MyException extends HttpException {
    constructor(message: string) {
        super(HttpStatus.BAD_REQUEST, message);
    }
    public withExceptionCode(statusCode: HttpStatus) {
        this.status = statusCode
        return this
    }
}