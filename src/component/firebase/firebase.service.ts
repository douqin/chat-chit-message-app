import { AndroidConfig, Message, MulticastMessage } from "firebase-admin/lib/messaging/messaging-api";
import firebase from "../../config/firebase/firebase";

export default class ServiceFCM {
    private static instace: ServiceFCM;
    private firebase: typeof firebase = firebase;
    public static gI() {
        if (ServiceFCM.instace == null) {
            return ServiceFCM.instace = new ServiceFCM();
        }
        return ServiceFCM.instace;
    }
    public sendNotification(message: Message, token: String) {
        this.firebase.messaging().send(message)
            .then((response) => {
                // Response is a message ID string.
            })
            .catch((error) => {
                //return error
            });
    }
    public sendMulticast(data: string, listToken: Array<string>) {
        let androidconfig: AndroidConfig = {
        }
        let message: MulticastMessage = {
            data: {
                data: data
            },
            android: androidconfig,
            tokens: listToken
        }
        this.firebase.messaging().sendMulticast(message)
            .then((response) => {
                console.log(" Send Noti successCount:" + response.successCount);
            })
            .catch((error) => {
                console.log(error);
            });
    }
}