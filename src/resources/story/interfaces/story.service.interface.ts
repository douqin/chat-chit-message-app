export default interface iStoryServiceBehavior {
    uploadStory(file : any, iduser : number) : Promise<any>

    getAllStoryFromFriends(iduser: number) : Promise<any>

    deleteStory() : Promise<any>

    seeStory() : Promise<any>
}