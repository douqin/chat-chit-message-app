import Token from "@/utils/definition/token"

export class User {
    constructor(
        public iduser: number,
        public name: string,
        public phone: string,
        public birthday: Date,
        public gender: number,
        public avatar: string,
        public email?: string,
    ) { }
    static fromRawData(data: any): User {
        const { iduser, name, email, phone, birthday, gender, avatar } = data;
        return new User(
            iduser, name, phone, birthday, gender, avatar, email
        );
    }
}
export interface LoginSuccessfully {
    user: User
    token: Token
}