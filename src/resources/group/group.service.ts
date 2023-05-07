import GroupChat from "./dtos/group.dto";
import GroupRepository from "./group.repository";
import LastViewGroup from "./dtos/lastview.dto";
import GroupServiceBehavior from "@/resources/group/interface/group.service.interface";
import GroupRepositoryBehavior from "./interface/group.repository.interface";
import { User } from "../auth/login/dtos/user.dto";

export default class GroupService implements GroupServiceBehavior {
    private groupRepsitory: GroupRepositoryBehavior
    constructor() {
        this.groupRepsitory = new GroupRepository()
    }
    async getAllMember(idgroup: number): Promise<User[]> {
        let data =  await this.groupRepsitory.getAllMember(idgroup);
        if (data) {
            return data.map<User>((value, index, array) => {
                return User.fromRawData(value)
            });
        }
        return [];
    }
    async getOneGroup(idgroup: number): Promise<GroupChat | null> {
        let data =  await this.groupRepsitory.getOneGroup(idgroup);
        if (data) {
            return  GroupChat.fromRawData(data)
        }
        return null;
    }
    async inviteMember(iduser: any, idgroup: number, userIDs: number[]): Promise<any> {

    }
    async leaveGroup(iduser: any, idgroup: number): Promise<boolean> {
        return await this.groupRepsitory.leaveGroup(iduser, idgroup)
    }
    async renameGroup(name: string, iduser: number): Promise<boolean> {
        return await this.groupRepsitory.renameGroup(name, iduser)
    }

    async getAllGroup(iduser: number): Promise<Array<GroupChat>> {
        let dataRaw = await this.groupRepsitory.getAllGroup(iduser)
        if (dataRaw) {
            return dataRaw.map<GroupChat>((value, index, array) => {
                return GroupChat.fromRawData(value)
            });
        }
        console.log(dataRaw)
        return []
    }

    async createGroup(name: string, iduser: number): Promise<boolean> { // FIXME: 
        return await this.groupRepsitory.createGroup(name, iduser)
    }
    async isContainMember(iduser: number, idgroup: number) {

    }
    async getLastViewMember(idgroup: number) {
        let rawDataSQL = await this.groupRepsitory.getLastViewMember(idgroup)
        if (rawDataSQL) {
            return rawDataSQL.map<LastViewGroup>((value, index, array) => {
                return LastViewGroup.fromRawData(value)
            });
        }
        console.log(rawDataSQL)
        return []
    }
}