import { MySql } from "@/config/sql/mysql";

export default class friendRepostory {
    async isContainRequest() {
        const getCount = 'SELECT * FROM friendrequest WHERE friendrequest.sender = ? AND friendrequest.receiver = ?'
        return true;
    }
    async inviteFriend(iduserSend: number, idReceiver: number) {
        const insertRequest = 'INSERT INTO friendrequest (friendrequest.sender, friendrequest.receiver) VALUES (?,?)'
        await MySql.excuteQuery(insertRequest, [iduserSend, idReceiver])
    }

}