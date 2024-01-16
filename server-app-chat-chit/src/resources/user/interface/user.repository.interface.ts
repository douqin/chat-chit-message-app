export interface iUserRepositoryBehavior {
    searchUser(phone: string): Promise<any>
    inforUser(username: string): Promise<any>
}