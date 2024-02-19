import { QueueEvents } from "bullmq";

const queueEvents = new QueueEvents('mail');
queueEvents.on("completed", (job, id) => {
    console.log("🚀 ~ file: queue-event-mail.ts ~ line 23 ~ queueEvents.on ~ job", job)
})
queueEvents.on("failed", (job, id) => {
    console.log("🚀 ~ file: queue-event-mail.ts ~ line 23 ~ queueEvents.on ~ job", job)
})
queueEvents.on("error", (e) => {
    console.log("🚀 ~ file: queue-event-mail.ts ~ line 23 ~ queueEvents.on ~ e", e)
})