import SocketMiddleware from '@/middleware/socket.middleware';
import Token from '@/utils/definition/token';
import authHandler from '../../component/auth.handler';
import { JwtPayload } from 'jsonwebtoken';
import { Server, Socket } from 'socket.io';
export default class SocketBuilder {
    private io: Server;
    constructor(io: Server) {
        this.io = io;
    }
    initalizeMiddleware(): SocketBuilder {

        return this
    }
    initalizeServer(): SocketBuilder {
        console.log("init socket")
        this.io.on("connection", this.initConnection)
        return this
    }
    build(): Server {
        return this.io
    }
    private initConnection = (socket: Socket) => {
        console.log("user connect to user with ID: " + socket.id)
        this.initalize(socket)
        socket.on('disconnect', () => {
            console.log("User disconnect" + socket.id)
        })

        socket.on('typing', async (conversationId: number) => {
            const token = socket.handshake.auth.token as Token
            if (token) {
                if (token.accessToken) {
                    const jwtPayload = await authHandler.decodeAccessToken(token.accessToken) as JwtPayload;
                    const { iduser } = jwtPayload.payload;
                    if (iduser) {
                        this.io.emit('typing', "con cac ne")
                        socket.broadcast
                            .to(`${conversationId}`)
                            .emit('typing', conversationId, iduser)
                    }
                }
            }
        });

        socket.on('not-typing', async (conversationId: number) => {
            const token = socket.handshake.auth.token as Token
            if (token) {
                if (token.accessToken) {
                    const jwtPayload = await authHandler.decodeAccessToken(token.accessToken) as JwtPayload;
                    const { iduser } = jwtPayload.payload;
                    if (iduser) {
                        socket.broadcast
                            .to(`${conversationId}`)
                            .emit('not-typing', conversationId, iduser)
                    }
                }
            }
        });
    }
    private initalize = async (socket: Socket) => {
        let token: Token = socket.handshake.auth.token as Token
        if (typeof socket.handshake.auth.token === 'string' && socket.handshake.auth.token !== null) {
            token = JSON.parse(socket.handshake.auth.token)
        }
        if (token) {
            if (token.accessToken) {5
                const jwtPayload = await authHandler.decodeAccessToken(token.accessToken) as JwtPayload;
                const { iduser } = jwtPayload.payload;
                socket.join(`${iduser}`)
                return;
            }
        }
    }
}


