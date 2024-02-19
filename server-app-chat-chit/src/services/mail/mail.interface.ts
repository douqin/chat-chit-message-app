import Mail from "nodemailer/lib/mailer";

export interface iMailService {
    sendMail(mailOptions : Mail.Options): Promise<any>
}