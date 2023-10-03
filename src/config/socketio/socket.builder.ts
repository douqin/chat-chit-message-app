import SocketMiddleware from '@/middleware/socket.middleware';
import GroupChat from '@/resources/group/dtos/group.dto';
import GroupRepository from '@/resources/group/group.repository';
import GroupService from '@/resources/group/group.service';
import { GroupActions } from '@/resources/group/interface/group.service.interface';
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
        this.io.on("connection", this.initConnection)
        return this
    }
    build(): Server {
        return this.io
    }
    async joinGroup(iduser: number, socket: Socket): Promise<void> {
        let serivce: GroupActions = new GroupService();
        let groups = await serivce.getAllGroup(iduser);
        for (let group of groups) {
            socket.join(`${group.idgroup}_group`);
        }
    }
    private initConnection = (socket: Socket) => {
        console.log("user connect to user with ID: " + socket.id + "--- iduser: " + socket.handshake.headers.iduser)
        this.joinGroup(Number(socket.handshake.headers.iduser), socket);
        socket.on('disconnect', () => {
            console.log("User disconnect" + socket.id)
        })
        socket.on("typing", (data: {
            idgroup: number,
            iduser: number
        }) => {
            console.log("🚀 ~ file: socket.builder.ts:37 ~ SocketBuilder ~ data:", data)
            socket.to(`${data.idgroup}_group`).emit("typing", data.iduser)
        })
        socket.on("typing_end", (data: {
            idgroup: number,
            iduser: number
        }) => {
            console.log("🚀 ~ file: socket.builder.ts:37 ~ SocketBuilder ~ data:", data)
            socket.to(`${data.idgroup}_group`).emit("typing_end", data.iduser)
        })
    }
}


