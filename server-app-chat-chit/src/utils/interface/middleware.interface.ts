import { RequestHandler } from "express";

export default interface Middlerware {
    validate(): RequestHandler
}