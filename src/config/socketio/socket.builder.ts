import SocketMiddleware from '@/middleware/socket.middleware';
import { Server, Socket } from 'socket.io';
export default class SocketBuilder {
    private io: Server;
    constructor(io: Server) {
        this.io = io;
    }
    initalizeMiddleware(): SocketBuilder {
        this.io.use(SocketMiddleware.validateIncomingConnect)
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
        socket.on('disconnect', () => {
            console.log("User disconnect" + socket.id)
        })
    }
}


