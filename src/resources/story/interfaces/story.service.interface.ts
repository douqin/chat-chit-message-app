export default interface iStoryServiceBehavior {
    uploadStory(file : any, iduser : number) : Promise<any>

    getAllStoryFromFriends(iduser: number) : Promise<any>

    deleteStory(idstory: number) : Promise<any>

    seeStory(idstory : number, iduser : number) : Promise<any>

    getViewedStory(iduser : number) : Promise<any>

}