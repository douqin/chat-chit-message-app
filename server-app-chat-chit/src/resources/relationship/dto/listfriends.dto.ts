import { User } from "@/models/user.model";
export class ListFriendDTO {
    public constructor(
        public listFriends: Array<User>,
        public nextCursor: number | null,
        public totalSize: number = 0
    ) { }
    static rawToDTO(arrRaw: any[]) {
        let dto = new ListFriendDTO([], null)
        for (let userRaw of arrRaw) {
            let user = User.fromRawData(userRaw);
            dto.listFriends.push(user)
            dto.nextCursor = user.userId
        }
        return dto
    }
}