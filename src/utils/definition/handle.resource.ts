import MyException from "../exceptions/my.exception"

export class Resource<T>{
    constructor(public data?: T, public error?: MyException) { }
}
export class SuccessData<T> extends Resource<T>{
    constructor(data: T) {
        super(data)
    }
}
export class ErrorData extends Resource<MyException>{
    constructor(error?: MyException) {
        super(undefined, error)
    }
}