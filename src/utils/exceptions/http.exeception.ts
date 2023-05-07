export default class HttpException extends Error {
    public status: number
    public success: boolean = false;
    constructor(status: number, message: string) {
        super()
        this.status = status
        this.message = message
    }
}