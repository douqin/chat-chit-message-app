// export type DataEventBusNotificationReceive = {
//     message: string,
//     sender: {
//         userId: string,
//         name: string,
//         avatar : string,
//     },
//     group: string,
//     room : string,
// }
export type DataEventBusNotificationReceive = {
    type: NotificationSendType,
    message: string,
    sender: {
        userId: string,
        name: string,
        avatar: string,
        groupId?: string,
    },
    room?: string,
}
export enum NotificationSendType {
    ROOM = 0,
    USER = 1,
    TOPIC = 2,
}