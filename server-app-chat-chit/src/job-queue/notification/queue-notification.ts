import { globalContainer } from "@/lib/common/di";
import { WorkerMQ } from "@/lib/common/job-queue";
import { DatabaseCache } from "@/lib/database";
import { FCMService } from "@/services/fcm/fcm.service";
import { iNotificationService } from "@/services/fcm/fcm.service.interface";
import { Job, Queue } from "bullmq";
import { DataEventBusNotificationReceive, NotificationSendType } from "src/even-bus/notification/data-define/rc";
let redisX = globalContainer.resolve(DatabaseCache).getInstance();
const notificationQueue = new Queue<any, any>('notification', { connection: redisX });
const ServiceFCM: iNotificationService = globalContainer.resolve(FCMService);
const sender = new WorkerMQ<DataEventBusNotificationReceive, any>('notification', async (job: Job<DataEventBusNotificationReceive, any>) => {
    switch (job.data.type) {
        case NotificationSendType.ROOM:
            break;
        case NotificationSendType.USER:
            break;
        case NotificationSendType.TOPIC:
            break;
    }
}, { connection: redisX });

export { notificationQueue } 