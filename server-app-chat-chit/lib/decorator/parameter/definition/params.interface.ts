export interface iParam {
    nameVariable?: string
    parameterIndex: number,
    type: Type
}

export enum Type{
    Body,
    Query,
    Param,
    Res,
    Req
}




