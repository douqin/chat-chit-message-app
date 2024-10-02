import { JwtPayload, TokenExpiredError } from "jsonwebtoken";
import { NextFunction, Request, Response } from "express"
import { BadRequestException, BaseMiddleware as BaseGuard, ForbiddenException, UnAuthorizedException } from "@/lib/common";
import { Middleware as Guard, Req, Res } from "@/lib/decorator";
import { container } from "tsyringe";
import { iInformationMember } from "@/resources/group/interface/group.service.interface";
import GroupService from "@/resources/group/group.service";
import { isValidNumberVariable } from "@/utils/validate";

@Guard()
export class AuthorizeMemberGuard extends BaseGuard {
    public async handle(@Req() req: Request, @Res() res: Response) : Promise<void | Error> {
        try {
            const userId = Number(req.headers.userId)
            const groupId = Number(req.params.groupId)
            if (!isValidNumberVariable(groupId)) {
                return (new BadRequestException("Invalid group id"))
            }
            let groupService: iInformationMember = container.resolve(GroupService)
            if (!await groupService.isUserExistInGroup(userId, groupId))
                return (new ForbiddenException("You're not a member of this group"))
        }
        catch (e: any) {
            return (e)
        }
    }
}