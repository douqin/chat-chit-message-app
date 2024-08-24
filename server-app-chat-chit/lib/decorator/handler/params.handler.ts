import { MotherController } from "@/lib/common";
import { requiredMetadataKeyParam } from "../parameter/definition/metadata-param";
import { iParam, TypeParam } from "../parameter/definition/params.interface";
import { NextFunction, Request, Response } from "express";
import { convertToObjectDTO } from "@/utils/validate";

export class ParamHandler {
    static async handle(destination: Object, methodName: string | symbol, req: Request, res: Response, next: NextFunction) {
        let args = [];
        let data: iParam[] =
            Reflect.getMetadata(
                requiredMetadataKeyParam,
                destination,
                methodName
            ) || [];
        let argsType: any[] = Reflect.getMetadata(
            "design:paramtypes",
            destination,
            methodName
        );
        if (data.length > 0) {
            args.length = 0;
            for (let _i = 0; _i < data.length; _i++) {
                let i = data[_i];
                switch (i.type) {
                    case TypeParam.Next:
                        args.push(next);
                        break;
                    case TypeParam.Res:
                        args.push(res);
                        break;
                    case TypeParam.Req:
                        args.push(req);
                        break;
                    case TypeParam.Body:
                        if (i.propertyKey) {
                            args.push(
                                await convertToObjectDTO(
                                    argsType[_i],
                                    req.body[i.propertyKey],
                                    undefined,
                                    { validationError: { target: false } }
                                )
                            );
                        } else
                            args.push(
                                await convertToObjectDTO(argsType[_i], req.body)
                            );
                        break;
                    case TypeParam.Params:
                        if (i.propertyKey) {
                            args.push(
                                await convertToObjectDTO(
                                    argsType[_i],
                                    req.params[i.propertyKey],
                                    undefined,
                                    { validationError: { target: false } }
                                )
                            );
                        } else args.push(req.params);
                        break;
                    case TypeParam.Query:
                        if (i.propertyKey) {
                            args.push(
                                await convertToObjectDTO(
                                    argsType[_i],
                                    req.query[i.propertyKey],
                                    undefined,
                                    { validationError: { target: false } }
                                )
                            );
                        } else
                            args.push(
                                await convertToObjectDTO(
                                    argsType[_i],
                                    req.query,
                                    undefined,
                                    { validationError: { target: false } }
                                )
                            );
                        break;
                    case TypeParam.Headers:
                        if (i.propertyKey) {
                            args.push(
                                await convertToObjectDTO(
                                    argsType[_i],
                                    req.headers[i.propertyKey],
                                    undefined,
                                    { validationError: { target: false } }
                                )
                            );
                        } else args.push(req.headers);
                        break;
                }
            }
        }
        return args;
    }
}