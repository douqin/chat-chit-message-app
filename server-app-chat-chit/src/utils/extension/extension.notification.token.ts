import { RemoteSocket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";

export function getAllNotificationTokenFromSockets(sockets: RemoteSocket<DefaultEventsMap, any>[]) {
    let notificationTokens: string[] = [];
    for (let socket of sockets) {
        let token = getNotificationTokenFromSocket(socket)
        if (token.length == 0) {
            notificationTokens.push(token)
        }
    }
    return notificationTokens;
}
export function getNotificationTokenFromSocket(socket: RemoteSocket<DefaultEventsMap, any>) {
    return String(socket.handshake.headers.notification)
}
export async function checkElementsInAnotInB<T>(listA: Array<T>, listB: Array<T>) {
    return listA.filter(elementA => !listB.includes(elementA));
}
// export async function getAllNotificationTokenFromServer(groupId: number) {
//     let query = "SELECT token.* FROM (token JOIN `user` JOIN member ON token.userId = user.userId AND user.userId = member.userId AND member.groupId = ? )"
//     let [data, inforC] = await .db.excuteQuery(query, [groupId]) as any
//     return data as Array<TokenDb>;
// }
export interface TokenDb {
    id: number,
    refreshtoken: string
    accesstoken: string
    userId: number
    notificationtoken: string
}