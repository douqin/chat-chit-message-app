
export class ResponseBody<T> {
    constructor(
        public success: boolean,
        public message: string = "", 
        public data: T) {}
} 
/**
 * export class ResponseBody<T> {
    constructor(
        public success: boolean,
        public message: string = "",
        public data: T,
        handlerCode: HttpStatus = HttpStatus.OK) {

    }
} 
 */