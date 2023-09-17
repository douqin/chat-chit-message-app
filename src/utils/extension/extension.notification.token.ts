import { Socket } from "socket.io";

export async function getAllNotificationTokenFromSockets(sockets : Socket[]){
    let notificationTokens : string[] = [];
    for(let socket of sockets){
        notificationTokens.push(String(socket.handshake.headers.notification))
    }
    return notificationTokens;
}
export async function checkElementsInAnotInB<T>(listA : Array<T>, listB :  Array<T>) {
    return listA.filter(elementA => !listB.includes(elementA));
}