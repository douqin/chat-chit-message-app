import { HttpStatus } from "../extension/httpstatus.exception";

export default class HttpException extends Error {
    public status: HttpStatus
    public success: boolean = false;
    constructor(status: number, message: string) {
        super()
        this.status = status
        this.message = message
    }
}