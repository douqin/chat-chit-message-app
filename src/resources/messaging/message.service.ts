import Message from "./dtos/message.dto";
import MessageRepository from "./message.repository";

export default class MessageService {
    async sendTextMessage(idgroup: number, iduser: number, content: string) {
        return await this.messageRepository.sendTextMessage(idgroup, iduser, content
        )
    }
    private messageRepository: MessageRepository
    constructor() {
        this.messageRepository = new MessageRepository()
    }
    async getAllMessageFromGroup(idgroup: number, iduser: number): Promise<Message[]> {
        let dataRaw = await this.messageRepository.getAllMessageFromGroup(idgroup, iduser)
        if (dataRaw) {
            return dataRaw.map<Message>((value, index, array) => {
                return Message.fromRawData(value)
            });
        }
        console.log(dataRaw)
        return []
    }
}