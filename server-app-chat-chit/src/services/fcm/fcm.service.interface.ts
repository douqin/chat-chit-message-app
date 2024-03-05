
export interface iNotificationService {
    sendMessageToUser(userId: number, data: any) : Promise<void>
    sendNotificationToGroupDevice(data: any, groupId: string) : Promise<void>
}