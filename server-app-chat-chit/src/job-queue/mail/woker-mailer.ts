import { globalContainer } from "@/lib/common/di";
import { WorkerMQ } from "@/lib/common/job-queue";
import { DatabaseCache } from "@/lib/database";
import { MailService } from "@/services/mail";
import { Job } from "bullmq";
import { DataMailReceive } from "./data-define/data-receive";
import { DataMailResult } from "./data-define/data-result";

let redisX = globalContainer.resolve(DatabaseCache).getInstance();
