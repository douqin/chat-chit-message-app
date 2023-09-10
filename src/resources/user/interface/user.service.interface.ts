export interface UserServiceBehavior {
    searchUser(phone: string): Promise<any>
}