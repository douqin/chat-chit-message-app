import { AndroidConfig, Message, MulticastMessage, TopicMessage } from "firebase-admin/lib/messaging/messaging-api";
import { NotificationService } from "./fcm.service.interface";
import { singleton } from "tsyringe";
import firebase from "./firebase/firebase";

@singleton()
export class ServiceFCM implements NotificationService {

    async sendMessageToUserOffInGroup(groupId: number, userId: number, data: any): Promise<void> {
        const message : TopicMessage = {
            data: data,
            topic: `${groupId}`
        };
        await this.firebase.messaging().send(message)
    }
    async sendMessageToUser(userId: number, iuserWantSend: number, data: any): Promise<void> {

    }
    private firebase: typeof firebase = firebase;

    public async sendNotification(message: string, token: string) {
        let data: Message = {
            data: {
                message
            },
            token: token
        }
        return await this.firebase.messaging().send(data);
    }
    public async sendMulticast(data: object, listToken: Array<string>) {
        let message: MulticastMessage = {
            data: {
                "data" : JSON.stringify(data)
            },
            tokens: listToken
        }
        let response = await this.firebase.messaging().sendEachForMulticast(message)
        return response
    }
}
