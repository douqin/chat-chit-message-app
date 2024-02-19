import { globalContainer } from "@/lib/common/di";
import { DatabaseCache } from "@/lib/database";
import {  Job, Queue } from "bullmq";
import { DataMailReceive } from "./data-define/data-receive";
import { DataMailResult } from "./data-define/data-result";
import { WorkerMQ } from "@/lib/common/job-queue";
import { MailService } from "@/services/mail";

let redisX = globalContainer.resolve(DatabaseCache).getInstance();
const mailQueue = new Queue<DataMailReceive, DataMailResult>('mail', { connection: redisX });
const mailServiceP = MailService.build();
const sender = new WorkerMQ<DataMailReceive, DataMailResult>('mail', async (job: Job<DataMailReceive, DataMailResult>) => {
    console.log("🚀 ~ file: queue-mail.ts ~ line 23 ~ sender.on ~ job", job.name)
    let mailService = await mailServiceP;
    return mailService.sendMail(job.data.opt);
}, { connection: redisX });

sender.on("completed", (job, id) => {
})
sender.on("failed", (job, id) => {
})
sender.on("error", (e) => {
    console.log("🚀 ~ file: queue-event-mail.ts ~ line 23 ~ queueEvents.on ~ error", e)
})

export { mailQueue } 
