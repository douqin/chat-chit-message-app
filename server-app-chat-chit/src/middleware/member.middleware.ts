import { JwtPayload, TokenExpiredError } from "jsonwebtoken";
import { NextFunction, Request, Response } from "express"
import { BadRequestException, BaseMiddleware as BaseGuard, ForbiddenException, UnAuthorizedException } from "@/lib/common";
import { Middleware as Guard } from "@/lib/decorator";
import { container } from "tsyringe";
import { iInformationMember } from "@/resources/group/interface/group.service.interface";
import GroupService from "@/resources/group/group.service";
import { isValidNumberVariable } from "@/utils/validate";

@Guard()
export class AuthorizeMemberGuard extends BaseGuard {
    public async use(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = Number(req.headers.userId)
            const groupId = Number(req.params.groupId)
            if (!isValidNumberVariable(groupId)) {
                next(new BadRequestException("Invalid group id"))
                return;
            }
            let groupService: iInformationMember = container.resolve(GroupService)
            if (!await groupService.isUserExistInGroup(userId, groupId))
                next(new ForbiddenException("You're not a member of this group"))
            next()
        }
        catch (e: any) {
            next(e)
        }
    }
}