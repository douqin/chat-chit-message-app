import Token from "@/utils/definition/token"

export class User {
    constructor(
        public iduser: number,
        public lastname: string,
        public firstname: string,
        public phone: string,
        public birthday: Date,
        public gender: number,
        public avatar: string,
        public bio: string,
        public username: string,
        public background: string
    ) { }
    static fromRawData(data: any): User {
        const { iduser, phone, birthday, gender, avatar, firstname, lastname, bio, username, background } = data;
        return new User(
            iduser, lastname, firstname, phone, birthday, gender, avatar, bio, username, background
        );
    }
}
export interface LoginSuccessfully {
    user: User
    token: Token
}