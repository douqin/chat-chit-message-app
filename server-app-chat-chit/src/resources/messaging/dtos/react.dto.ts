export default class Reaction {
    idReaction: Number;
    idMember: Number;
    idMessage: Number;
    type: Number;
    constructor(idReaction: Number,
        idMember: Number,
        idMessage: Number,
        type: Number) {
        this.idReaction = idReaction;
        this.idMember = idMember;
        this.idMessage = idMessage;
        this.type = type;
    }
}