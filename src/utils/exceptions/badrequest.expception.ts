import { HttpStatus } from "../extension/httpstatus.exception";
import HttpException from "./http.exeception";

export class BadRequest extends HttpException {
    public status: number
    public success: boolean = false;
    constructor(message: string) {
        super(HttpStatus.BAD_REQUEST, message)
        this.status = HttpStatus.BAD_REQUEST
        this.message = message
    }
}
export class UnAuthorized extends HttpException {
    public status: number
    public success: boolean = false;
    constructor(message: string) {
        super(HttpStatus.UNAUTHORIZED, message)
        this.status = HttpStatus.UNAUTHORIZED
        this.message = message
    }
}
export class Forbidden extends HttpException {
    public status: number
    public success: boolean = false;
    constructor(message: string) {
        super(HttpStatus.FORBIDDEN, message)
        this.status = HttpStatus.FORBIDDEN
        this.message = message
    }
}
export class NotFound extends HttpException {    
    public status: number
    public success: boolean = false;
    constructor(message: string) {
        super(HttpStatus.NOT_FOUND, message)
        this.status = HttpStatus.NOT_FOUND
        this.message = message
    }
}   
export class InternalServerError extends HttpException {
    public status: number
    public success: boolean = false;
    constructor(message: string) {
        super(HttpStatus.INTERNAL_SERVER_ERROR, message)
        this.status = HttpStatus.INTERNAL_SERVER_ERROR
        this.message = message
    }
}