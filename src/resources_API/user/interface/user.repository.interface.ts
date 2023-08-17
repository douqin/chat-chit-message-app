export interface UserRepositoryBehavior {
    searchUser(phone: string): Promise<any>
}