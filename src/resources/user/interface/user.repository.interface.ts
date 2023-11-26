export interface UserRepositoryBehavior {
    searchUser(phone: string): Promise<any>
    inforUser(phone: string, username : string): Promise<any>
}