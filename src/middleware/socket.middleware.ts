import HttpException from "@/utils/exceptions/http.exeception";
import { HttpStatus } from "@/utils/extension/httpstatus.exception";
import { JwtPayload } from "jsonwebtoken";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { Socket } from "socket.io";
import { DatabaseCache } from "@/config/database/redis";
import { ConstantRedis } from "@/config/database/constant";
import { container } from "tsyringe";
import { JwtService } from "../component/jwt/jwt.service";
class SocketMiddleware {
    static validateIncomingConnect = async (socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap>, next: any) => {
        try {
            let token = String((socket.handshake.headers.token as string).split(" ")[1]);
            let notificationToken = String(socket.handshake.headers.notification)
            if (token && notificationToken) {
                if (token) {
                    const jwtPayload = await container.resolve(JwtService).decodeAccessToken(token) as JwtPayload;
                    const { iduser } = jwtPayload.payload;
                    if (iduser) {
                        socket.handshake.headers.iduser = iduser
                        // DatabaseCache.getInstance().sadd(ConstantRedis.KEY_USER_ONLINE, iduser)
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