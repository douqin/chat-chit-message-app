export default interface GroupRepositoryBehavior {
    leaveGroup(iduser: any, idgroup: number): boolean | Promise<boolean>
    getAllGroup(iduser: number): Promise<object[] | undefined>
    createGroup(name: string, iduser: number): Promise<boolean>
    //  isContainInGroup(iduser: number, idgroup: number) : Promise<void>
    getLastViewMember(idgroup: number): Promise<object[] | undefined>
    renameGroup(name: string, iduser: number): Promise<boolean>
    getOneGroup(iduser: number): Promise<object | null>
    getAllMember(idgroup: number): Promise<object[] | null>
    changeAvatarGroup(iduser: number, idgroup: number, file: Express.Multer.File): Promise<any>
    isContainInGroup(iduser: number, idgroup: number): Promise<boolean>
    joinGroup(iduser: number, idgroup: number): Promise<void>
}