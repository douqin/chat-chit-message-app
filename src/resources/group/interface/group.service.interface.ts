import GroupChat from "../dtos/group.dto";
import LastViewGroup from "../dtos/lastview.dto";

export default interface GroupServiceBehavior {
    inviteMember(iduser: any, idgroup: number, userIDs: Array<number>): unknown;
    leaveGroup(iduser: number, idgroup : number): Promise<boolean>;
    getAllGroup(iduser: number): Promise<Array<GroupChat>>
    createGroup(name: string, iduser: number): Promise<boolean>
    getLastViewMember(idgroup: number): Promise<LastViewGroup[]>
    renameGroup(name: string, iduser: number): Promise<boolean>
}