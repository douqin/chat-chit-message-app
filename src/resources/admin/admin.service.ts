import { AdminRepositoryBehavior } from './interface/admin.repository.interface';
import AdminRepository from "./admin.repository";
import { AdminServiceBehavior } from "./interface/admin.service.interface";

export default class AdminService implements AdminServiceBehavior {
    async renameGroup(name: string, idgroup: number) {
        return await this.adminRepository.renameGroup(name, idgroup)
    }
    adminRepository: AdminRepositoryBehavior

    deleteManager(iduser: any, id: any) {
        throw new Error("Method not implemented.");
    }
    addManager(iduser: any, id: any) {
        throw new Error("Method not implemented.");
    }

    constructor() {
        this.adminRepository = new AdminRepository()
    }
    async deleteMember(iduser: number, idgroup: number) {
        await this.adminRepository.deleteMember(idgroup)
    }
    async isAdminGroup(iduser: number, idgroup: number): Promise<boolean> {
        let dataRaw : any = await this.adminRepository.getListIdAdmin(idgroup)
        if (dataRaw.length == 1 && dataRaw.at(0) == iduser) {
            return true;
        }
        return false;
    }
}