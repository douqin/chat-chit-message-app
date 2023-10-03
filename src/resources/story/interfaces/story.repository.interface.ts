export default interface iStoryRepositoryBehavior {
    uploadStory(file : Express.Multer.File, iduser : number) : Promise<any>

    getAllStoryFromFriends(iduser: number) : Promise<any>

    deleteStory() : Promise<any>

    seeStory() : Promise<any>
}