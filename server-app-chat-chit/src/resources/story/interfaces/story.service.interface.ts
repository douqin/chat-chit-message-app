import { ReactMessage } from "@/resources/messaging/enum/message.react.enum"
import { ReactStory } from "../enums/story.react.enum"

export default interface iStoryServiceBehavior {

    reacStory(idstory : number, iduser : number, react : ReactStory) : Promise<any>
    
    uploadStory(file : any, iduser : number) : Promise<any>

    getAllStoryFromFriends(iduser: number) : Promise<any>

    deleteStory(idstory: number) : Promise<any>

    seeStory(idstory : number, iduser : number) : Promise<any>

}