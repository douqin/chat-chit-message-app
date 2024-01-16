import { AndroidConfig, Message, MulticastMessage, TopicMessage } from "firebase-admin/lib/messaging/messaging-api";
import firebase from "../../config/firebase/firebase";
import { NotificationService } from "./firebase.service.interface";

export class ServiceFCM implements NotificationService {

    private static instance = new ServiceFCM();

    private constructor(){}

    public static gI(){
        return ServiceFCM.instance;
    } 

    async sendMessageToUserOffInGroup(idgroup: number, iduser: number, data: any): Promise<void> {
        const message : TopicMessage = {
            data: data,
            topic: `${idgroup}`
        };
        await this.firebase.messaging().send(message)
    }
    async sendMessageToUser(iduser: number, iuserWantSend: number, data: any): Promise<void> {

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
