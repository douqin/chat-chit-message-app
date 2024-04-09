import { JwtPayload } from "jsonwebtoken";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { Socket } from "socket.io";
import { container } from "tsyringe";
import { JwtAuthService } from "../services/jwt/jwt.service";
import { HttpException, HttpStatus } from "@/lib/common";
class SocketMiddleware {
    static validateIncomingConnect = async (socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap>, next: any) => {
        try {
            let token = String((socket.handshake.headers.token as string).split(" ")[1]);
            let notificationToken = String(socket.handshake.headers.notification)
            if (token && notificationToken) {
                if (token) {
                    const jwtPayload = await container.resolve(JwtAuthService).decodeAccessToken(token) as JwtPayload;
                    const { userId } = jwtPayload.payload;
                    if (userId) {
                        socket.handshake.headers.userId = userId
                        // DatabaseCache.getInstance().sadd(ConstantRedis.KEY_USER_ONLINE, userId)
                        socket.join(`${userId}_user`)
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