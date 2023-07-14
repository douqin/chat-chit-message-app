export default class MyException extends Error {
    constructor( message: string) {
        super();
        this.message = message
    }
}