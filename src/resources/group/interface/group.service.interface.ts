import { User } from "@/resources/auth/login/dtos/user.dto";
import GroupChat from "../dtos/group.dto";
import LastViewGroup from "../dtos/lastview.dto";
import DataFileDrive from "component/cloud/dtos/file.drive.dtos";

export default interface GroupServiceBehavior {
    inviteMember(iduser: any, idgroup: number, userIDs: Array<number>): unknown;
    leaveGroup(iduser: number, idgroup: number): Promise<boolean>;
    getAllGroup(iduser: number): Promise<Array<GroupChat>>
    createGroup(name: string, iduser: number): Promise<boolean>
    getLastViewMember(idgroup: number): Promise<LastViewGroup[]>
    getOneGroup(idgroup: number): Promise<GroupChat | null>
    getAllMember(idgroup: number): Promise<User[]>
    changeAvatarGroup(iduser: number, idgroup: number, file: Express.Multer.File): Promise<DataFileDrive | null>
    isContainInGroup(iduser: number, idgroup: number): Promise<boolean>
}