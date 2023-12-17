export interface UserRepositoryBehavior {
    searchUser(phone: string): Promise<any>
    inforUser(username: string): Promise<any>
}