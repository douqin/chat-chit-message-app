import { RequestHandler } from "express";
import multer from "multer";

export function FileUpload(multer: RequestHandler) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        Reflect.defineMetadata('multer', multer, target[propertyKey]);
    };
}