import Token from "@/utils/definition/token"

export class User {
    constructor(
        public userId: number,
        public lastName: string,
        public firstName: string,
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
        const { userId, phone, birthday, gender, avatar, firstname, lastName, bio, username, background, email } = data;
        return new User(
            userId, lastName, firstname, phone, birthday, gender, bio, username, avatar, background, email
        );
    }
}
export interface LoginSuccessfully {
    user: User
    token: Token
}