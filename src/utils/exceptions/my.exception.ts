export default class MyException extends Error {
    public message: string
    statusCode: number;
    constructor(statusCode: number, message: string) {
        super();
        this.statusCode = statusCode
        this.message = message
    }
}