import { Database } from "@/config/database/database";
import { RemoteSocket, Socket } from "socket.io";
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
export async function getAllNotificationTokenFromServer(idgroup: number) {
    let query = "SELECT token.* FROM (token JOIN `user` JOIN member ON token.iduser = user.iduser AND user.iduser = member.iduser AND member.idgroup = ? )"
    let [data, inforC] = await Database.excuteQuery(query, [idgroup]) as any
    return data as Array<TokenDb>;
}
export interface TokenDb {
    id: number,
    refreshtoken: string
    accesstoken: string
    iduser: number
    notificationtoken: string
}