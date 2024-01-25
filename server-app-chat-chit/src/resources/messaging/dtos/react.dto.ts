export default class Reaction {
    reactionId: Number;
    userId: Number;
    messageId: Number;
    type: Number;
    constructor(idReaction: Number,
        memberId: Number,
        messageId: Number,
        type: Number) {
        this.reactionId = idReaction;
        this.userId = memberId;
        this.messageId = messageId;
        this.type = type;
    }
}