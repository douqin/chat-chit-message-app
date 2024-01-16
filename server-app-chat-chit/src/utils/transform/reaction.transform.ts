import Reaction from "@/resources/messaging/dtos/react.dto";

export default class TransformReaction {
    public static rawToModel(data: any): Reaction {
        const { idreaction, idmessage, type, idmember } = data;
        return new Reaction(
            idreaction, idmember, idmessage, type
        );
    }
}