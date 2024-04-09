export interface iParam {
    parameterIndex: number,
    type: Type,
    propertyKey?: string
}

export enum Type{
    Body,
    Query,
    Params,
    Res,
    Req,
    Next,
    Headers
}




