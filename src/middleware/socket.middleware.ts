
import Token from "@/utils/definition/token";
import HttpException from "@/utils/exceptions/http.exeception";
import { HttpStatus } from "@/utils/extension/httpstatus.exception";
import { Server, Socket } from "socket.io";
import authHandler from "../component/auth.handler";
import { JwtPayload } from "jsonwebtoken";
import { ExtendedError } from "socket.io/dist/namespace";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
class SocketMiddleware {
    static validateIncomingConnect = async (socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap>, next: any) => {
        console.log(" user in SocketMiddleware with ID: " + socket.id)
        try {
            let token = (socket.handshake.headers.token as string).split(" ")[1];
            console.log("🚀 ~ file: socket.middleware.ts:15 ~ SocketMiddleware ~ validateIncomingConnect= ~ token:", token)
            if (token) {
                if (token) {
                    await authHandler.decodeAccessToken(token) as JwtPayload;
                    next()
                    return;
                }
            }
        }
        catch (e: any) {
        }
        next(new HttpException(HttpStatus.NON_AUTHORITATIVE_INFORMATION, "Bạn không có quyền kết nối"))
    };
}
export default SocketMiddleware;