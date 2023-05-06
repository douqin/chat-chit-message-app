export interface AdminRepositoryBehavior {
    renameGroup(name: string, idgroup: number): unknown;
    getListIdAdmin(idgroup: number): unknown;
    deleteMember(idgroup: number): unknown;

}