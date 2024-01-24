export interface TwilioInterface {
    sendSMS(phone: string, message: string): Promise<any>;
}