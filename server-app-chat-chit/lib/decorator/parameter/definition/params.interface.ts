export interface iParam {
    parameterIndex: number,
    type: TypeParam,
    propertyKey?: string
}

export enum TypeParam{
    Body,
    Query,
    Params,
    Res,
    Req,
    Next,
    Headers
}




