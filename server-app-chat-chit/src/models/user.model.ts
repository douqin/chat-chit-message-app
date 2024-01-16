import Token from "@/utils/definition/token"

export class User {
    constructor(
        public iduser: number,
        public lastname: string,
        public firstname: string,
        public phone: string,
        public birthday: Date,
        public gender: number,
        public bio: string,
        public username: string,
        public avatar?: string,
        public background? : string,
        public email? : string, 
    ) { }
    static fromRawData(data: any): User {
        const { iduser, phone, birthday, gender, avatar, firstname, lastname, bio, username, background, email } = data;
        return new User(
            iduser, lastname, firstname, phone, birthday, gender, bio, username, avatar, background, email
        );
    }
}
export interface LoginSuccessfully {
    user: User
    token: Token
}