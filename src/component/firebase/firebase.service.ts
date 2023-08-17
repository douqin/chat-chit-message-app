import { AndroidConfig, Message, MulticastMessage } from "firebase-admin/lib/messaging/messaging-api";
import firebase from "../../config/firebase/firebase";
import { NotificationService } from "./firebase.service.interface";

export class ServiceFCM implements NotificationService {
    async sendMessageToUserOffInGroup(idgroup: number, iduser: number, data: any): Promise<void> {
        this.firebase.messaging().sendToTopic(`${idgroup}`, { data })
    }
    async sendMessageToUser(iduser: number, iuserWantSend: number, data: any): Promise<void> {
        
    }
    private firebase: typeof firebase = firebase;

    private async sendNotification(message: string, token: string) {
        let data: Message = {
            data: {
                message
            },
            token: token,
            android: undefined
        }
        let response = await this.firebase.messaging().send(data);
    }
    private async sendMulticast(data: string, listToken: Array<string>) {
        let androidconfig: AndroidConfig = {
        }
        let message: MulticastMessage = {
            data: {
                data
            },
            android: androidconfig,
            tokens: listToken
        }
        let response = await this.firebase.messaging().sendMulticast(message)
    }
}
