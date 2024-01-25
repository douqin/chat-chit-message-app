import { Twilio } from "twilio";
import { TwilioInterface } from "./twilio.interface";

export class SmsService implements TwilioInterface {
    private twilioClient: Twilio;
    constructor() {
        this.twilioClient = new Twilio(
            process.env.TWILIO_ACCOUNT_SID,
            process.env.TWILIO_AUTH_TOKEN
        );
    }
    async sendSMS(phone: string, message: string) {
        try {
            const result = await this.twilioClient.messages.create({
                body: message,
                from: process.env.TWILIO_PHONE_NUMBER,
                to: phone,
            });
            return result;
        } catch (e) {
            console.log("🚀 ~ SmsService ~ sendSMS ~ e:", e)
        }
    }
}