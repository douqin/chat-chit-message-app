import HttpException from "@/utils/exceptions/http.exeception";
import { HttpStatus } from "@/utils/extension/httpstatus.exception";
import authHandler from "../component/auth.handler";
import { JwtPayload } from "jsonwebtoken";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { Socket } from "socket.io";
class SocketMiddleware {
    static validateIncomingConnect = async (socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap>, next: any) => {
        console.log(" user in SocketMiddleware with ID: " + socket.id)
        try {
            let token = (socket.handshake.headers.token as string).split(" ")[1];
            console.log("🚀 ~ file: socket.middleware.ts:15 ~ SocketMiddleware ~ validateIncomingConnect= ~ token:", token)
            if (token) {
                if (token) {
                    const jwtPayload = await authHandler.decodeAccessToken(token) as JwtPayload;
                    const { iduser } = jwtPayload.payload;
                    socket.handshake.headers.iduser = iduser
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