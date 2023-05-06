import Token from "@/utils/definition/token"

export interface User {
    iduser: number,
    name: string,
    phone: string,
    email?: string,
    birthday: Date,
    gender: number,
}
export interface LoginSuccessfully {
    user : User
    token : Token
}