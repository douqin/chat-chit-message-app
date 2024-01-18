export default class Reaction {
    reactionId: Number;
    userId: Number;
    messageId: Number;
    type: Number;
    constructor(idReaction: Number,
        idMember: Number,
        idMessage: Number,
        type: Number) {
        this.reactionId = idReaction;
        this.userId = idMember;
        this.messageId = idMessage;
        this.type = type;
    }
}