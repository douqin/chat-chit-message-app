export default class MemberDTO {
    static fromRawData(data: any): MemberDTO {
        return new MemberDTO(
            data.iduser,
            data.email,
            data.phone,
            data.password,
            data.lastname,
            new Date(data.birthday),
            data.gender,
            data.avatar,
            data.background,
            data.firstname,
            data.bio,
            data.username,
            data.id,
            data.idgroup,
            data.lastview ? new Date(data.lastview) : null,
            data.position,
            data.status,
            new Date(data.timejoin))
    }
    iduser: number;
    email: string | null;
    phone: string;
    password: string;
    lastname: string;
    birthday: Date;
    gender: number;
    avatar: string | null;
    background: string | null;
    firstname: string;
    bio: string;
    username: string | null;
    id: number;
    idgroup: number;
    lastview: Date | null;
    position: number;
    status: number;
    timejoin: Date;

    constructor(
        iduser: number,
        email: string | null,
        phone: string,
        password: string,
        lastname: string,
        birthday: Date,
        gender: number,
        avatar: string | null,
        background: string | null,
        firstname: string,
        bio: string,
        username: string | null,
        id: number,
        idgroup: number,
        lastview: Date | null,
        position: number,
        status: number,
        timejoin: Date
    ) {
        this.iduser = iduser;
        this.email = email;
        this.phone = phone;
        this.password = password;
        this.lastname = lastname;
        this.birthday = birthday;
        this.gender = gender;
        this.avatar = avatar;
        this.background = background;
        this.firstname = firstname;
        this.bio = bio;
        this.username = username;
        this.id = id;
        this.idgroup = idgroup;
        this.lastview = lastview;
        this.position = position;
        this.status = status;
        this.timejoin = timejoin;
    }
}
