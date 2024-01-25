export default class Story {
    storyId: number
    userIdOwner: number
    createat: Date
    content: string
    viewed : boolean 

    constructor(storyId: number,
        userIdOwner: number,
        createat: Date,
        content: string) {
        this.content = content
        this.storyId = storyId
        this.createat = createat
        this.userIdOwner = userIdOwner
        this.viewed = false
    }
}