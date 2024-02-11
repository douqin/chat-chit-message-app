export default class Story {
    storyId: number
    userIdOwner: number
    createAt: Date
    content: string
    viewed : boolean 

    constructor(storyId: number,
        userIdOwner: number,
        createAt: Date,
        content: string) {
        this.content = content
        this.storyId = storyId
        this.createAt = createAt
        this.userIdOwner = userIdOwner
        this.viewed = false
    }
}