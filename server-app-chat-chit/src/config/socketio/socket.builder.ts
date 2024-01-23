import SocketMiddleware from '@/middleware/socket.middleware';
import GroupService from '@/resources/group/group.service';
import { iGroupActions } from '@/resources/group/interface/group.service.interface';
import { Server, Socket } from 'socket.io';
import { JwtPayload } from 'jsonwebtoken';
import { DatabaseCache } from '../../../lib/database/redis/redis';
import { ConstantRedis } from '../../../lib/database/constant';
import { container } from 'tsyringe';
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
        let serivce: iGroupActions = container.resolve(GroupService);
        let groups = await serivce.getAllGroup(iduser);
        for (let group of groups) {
            socket.join(`${group.groupId}_group`);
        }
    }

    private initConnection = (socket: Socket) => {
        const iduser = socket.handshake.headers.iduser
        this.joinGroup(Number(iduser), socket);
        // DatabaseCache.getInstance().sadd(ConstantRedis.KEY_USER_ONLINE, String(iduser))
        socket.on('disconnect', async () => {
            console.log("User disconnect" + socket.id)
            const iduser = socket.handshake.headers.iduser
            // DatabaseCache.getInstance().srem(ConstantRedis.KEY_USER_ONLINE, String(iduser))
        })
        socket.on("typing", async (data: {
            idgroup: number,
            iduser: number
        }) => {
            socket.to(`${data.idgroup}_group`).except(socket.id).emit("typing", data.iduser)
        })
        socket.on("typing_end", (data: {
            idgroup: number,
            iduser: number
        }) => {
            console.log("🚀 ~ file: socket.builder.ts:37 ~ SocketBuilder ~ data:", data)
            socket.to(`${data.idgroup}_group`).except(socket.id).emit("typing_end", data.iduser)
        })
    }
}


