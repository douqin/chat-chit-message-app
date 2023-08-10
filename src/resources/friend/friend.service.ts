import FriendRepostory from "./friend.repository"

export default class FriendService {
    async inviteFriend(iduserSend: number, idReceiver: number) {
        if (await !this.friendRepostory.isContainRequest()) {
            await this.friendRepostory.inviteFriend(iduserSend, idReceiver)
        }
    }
    friendRepostory: FriendRepostory
    constructor() {
        this.friendRepostory = new FriendRepostory()
    }

}