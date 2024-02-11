import Reaction from "@/resources/messaging/dtos/react.dto";

export class TransformReaction {
    public static rawToModel(data: any): Reaction {
        const { idreaction, messageId, type, userId } = data;
        return new Reaction(
            idreaction, userId, messageId, type
        );
    }
}