import { Type } from "class-transformer"
import { IsNumber, IsPositive } from "class-validator"

export abstract class PagingRes<T, V> {
    public data: T[]
    public nextCursor: V
    public totalSize: number = 0
    constructor(data: T[], nextCursor: V, totalSize: number = 0) {
        this.data = data
        this.nextCursor = nextCursor
        this.totalSize = totalSize
    }
}
export class PagingReq {
    @IsNumber()
    @Type(() => Number)
    @IsPositive()
    limit: number
    @IsNumber()
    @Type(() => Number)
    cursor: number
}