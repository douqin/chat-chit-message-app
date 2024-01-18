import Reaction from "@/resources/messaging/dtos/react.dto";

export default class TransformReaction {
    public static rawToModel(data: any): Reaction {
        const { idreaction, idmessage, type, iduser } = data;
        return new Reaction(
            idreaction, iduser, idmessage, type
        );
    }
}