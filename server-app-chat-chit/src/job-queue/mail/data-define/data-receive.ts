import Mail from "nodemailer/lib/mailer"

export type DataMailReceive<V = any> = {
    opt: Mail.Options,
}
