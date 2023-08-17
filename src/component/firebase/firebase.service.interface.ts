import { Message } from "firebase-admin/lib/messaging/messaging-api"
import { RemoteSocket, Server } from "socket.io"
import { DefaultEventsMap } from "socket.io/dist/typed-events"

export interface NotificationService {
    sendMessageToUserOffInGroup(idgroup: number, iduser: number, data: any): Promise<void> 
    sendMessageToUser(iduser: number, iuserWantSend: number, data: any) : void
}