import { globalContainer } from "@/lib/common/di";
import { DatabaseCache } from "@/lib/database";
import { Queue } from "bullmq";
let redisX = globalContainer.resolve(DatabaseCache).getInstance();
const notificationQueue = new Queue<any, any>('notification', { connection: redisX });
// const mailServiceP = MailService.build();
// const sender = new WorkerMQ<DataMailReceive, DataMailResult>('mail', async (job: Job<DataMailReceive, DataMailResult>) => {
//     console.log("🚀 ~ file: queue-mail.ts ~ line 23 ~ sender.on ~ job", job.name)
//     let mailService = await mailServiceP;
//     return mailService.sendMail(job.data.opt);
// }, { connection: redisX });

export { notificationQueue } 