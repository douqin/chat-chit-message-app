import { BatchResponse } from "firebase-admin/lib/messaging/messaging-api"

export interface NotificationService {
    sendMessageToUserOffInGroup(groupId: number, userId: number, data: any): Promise<void> 
    sendMessageToUser(userId: number, iuserWantSend: number, data: any) : void
    sendMulticast(data: object, listToken: Array<string>) : Promise<BatchResponse>
    sendNotification(message: string, token: string) : Promise<string>
}