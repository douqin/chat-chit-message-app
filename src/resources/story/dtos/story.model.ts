export default class Story {

    idstory: number
    iduserowner: number
    createat: Date
    content: string

    constructor(idstory: number,
        iduserowner: number,
        createat: Date,
        content: string) {
        this.content = content
        this.idstory = idstory
        this.createat = createat
        this.iduserowner = iduserowner
    }

}