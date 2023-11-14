import { User } from "@/resources/auth/dtos/user.dto";

export class ListFriendDTO{
    public constructor(
        public listFriends : Array<User>,
        public nextCursor : number | null
    ){}
    static rawToDTO(arrRaw : any[]){
        let dto = new ListFriendDTO([], null)
        for (let userRaw of arrRaw) {
            let user = User.fromRawData(userRaw);
            dto.listFriends.push(user)
            dto.nextCursor = user.iduser
        }
        return dto
    }
}