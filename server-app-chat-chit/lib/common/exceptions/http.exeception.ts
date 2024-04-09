import { HttpStatus } from "./httpstatus.exception";

export class HttpException extends Error {
    public status: HttpStatus
    public success: boolean = false;
    constructor(status: number, message: string) {
        super()
        this.status = status
        this.message = message
    }
}