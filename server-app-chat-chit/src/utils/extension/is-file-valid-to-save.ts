import { MessageType } from "@/resources/messaging/enum/message.type.enum";

export function isValidTypeFileToUpload(file: Express.Multer.File): boolean {
    const validType = ['image', 'video', 'audio'];
    const type = file.mimetype.split('/')[0];
    return validType.includes(type);
}
export function getTypeFile(file: Express.Multer.File): MessageType {
    const type = file.mimetype.split('/')[0];
    switch (type) {
        case 'image':
            return MessageType.IMAGE;
        case 'video':
            return MessageType.VIDEO;
        case 'audio':
            return MessageType.AUDIO;
        default:
            throw Error('Invalid file type');
    }
}