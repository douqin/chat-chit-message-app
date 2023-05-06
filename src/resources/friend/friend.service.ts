import FriendRepostory from "./friend.repository"

export default class FriendService {
    friendRepostory: FriendRepostory
    constructor() {
        this.friendRepostory = new FriendRepostory()
    }

}