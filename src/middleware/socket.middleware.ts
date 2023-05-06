
import Token from "@/utils/definition/token";
import HttpException from "@/utils/exceptions/http.exeception";
import { HttpStatus } from "@/utils/exceptions/httpstatus.exception";
import { Server, Socket } from "socket.io";
import authHandler from "../component/auth.handler";
import { JwtPayload } from "jsonwebtoken";
class SocketMiddleware {
    static validateEveryConnection(io: Server) {
        
        io.use(async (socket, next) => {
            console.log(" user in SocketMiddleware with ID: " + socket.id)
            try {
                let token: Token = socket.handshake.auth.token as Token
                if (typeof socket.handshake.auth.token === 'string' && socket.handshake.auth.token !== null) {
                    token = JSON.parse(socket.handshake.auth.token)
                }
                if (token) {
                    if (token.accessToken) {5
                        const jwtPayload = await authHandler.decodeAccessToken(token.accessToken) as JwtPayload;
                        const { iduser } = jwtPayload.payload;
                        next()
                        return;
                    }
                }
            }
            catch (e: any) {
                console.log(e);
            }
            next(new HttpException(HttpStatus.NON_AUTHORITATIVE_INFORMATION, "Bạn không có quyền kết nối"))
        });
    }
    static validateUserEveryRequest(socket: Socket) {
        // socket.disconnect(true);
    }
}
export default SocketMiddleware;