export default interface iStoryRepositoryBehavior {
    uploadStory(file : Express.Multer.File, iduser : number) : Promise<any>

    getAllStoryFromFriends(iduser: number) : Promise<any>

    deleteStory(idstory : number) : Promise<any>

    seeStory(idstory : number, iduser : number) : Promise<any>

    getViewedStory(iduser : number) : Promise<any>
}