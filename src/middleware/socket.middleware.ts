import HttpException from "@/utils/exceptions/http.exeception";
import { HttpStatus } from "@/utils/extension/httpstatus.exception";
import authHandler from "../component/auth.handler";
import { JwtPayload } from "jsonwebtoken";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { Socket } from "socket.io";
class SocketMiddleware {
    static validateIncomingConnect = async (socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap>, next: any) => {
        try {
            let token = String((socket.handshake.headers.token as string).split(" ")[1]);
            let notificationToken = String(socket.handshake.headers.notification)
            if (token && notificationToken) {
                if (token) {
                    const jwtPayload = await authHandler.decodeAccessToken(token) as JwtPayload;
                    const { iduser } = jwtPayload.payload;
                    if (iduser) {
                        socket.handshake.headers.iduser = iduser
                        socket.join(`${iduser}_user`)
                    }
                    next()
                    return
                }
            }
        }
        catch (e: any) {
        }
        next(new HttpException(HttpStatus.NON_AUTHORITATIVE_INFORMATION, "Bạn không có quyền kết nối"))
        console.log(socket.id + "-> DISCONNECT BY MIDDLEWARE")
    };
}
export default SocketMiddleware;