export interface AdminServiceBehavior {
    renameGroup(name: any, arg1: number): unknown
    deleteManager(iduser: any, id: any): any
    addManager(iduser: any, id: any): any
    deleteMember(iduser: number, idgroup: number): any
    isAdminGroup(iduser: number, idgroup: number): Promise<boolean>
}