import { TopicMessage } from "firebase-admin/lib/messaging/messaging-api";
import { iNotificationService as iNotificationService } from "./fcm.service.interface";
import { singleton } from "tsyringe";
import firebase from "./firebase/firebase";
import { getRoomGroupIO } from "@/utils/extension/room.group";

@singleton()
export class FCMService implements iNotificationService {
    private firebase = firebase;
    async sendNotificationToGroupDevice(data: any, groupId: string): Promise<void> {
        const message: TopicMessage = {
            data: data,
            topic: getRoomGroupIO(Number(groupId))
        };
        await this.firebase.messaging().send(message)
    }
    async sendMessageToUser(userId: number, data: any): Promise<void> {
        const message: TopicMessage = {
            data: data,
            topic: getRoomGroupIO(Number(userId))
        };
        await this.firebase.messaging().send(message)
    }
}
