import SocketMiddleware from '@/middleware/socket.middleware';
import GroupService from '@/resources/group/group.service';
import { iGroupActions } from '@/resources/group/interface/group.service.interface';
import { Server, Socket } from 'socket.io';
import { JwtPayload } from 'jsonwebtoken';
import { DatabaseCache } from '../../../lib/database/redis/redis';
import { ConstantRedis } from '../../../lib/database/constant';
import { container } from 'tsyringe';
import { getRoomGroupIO } from '@/utils/extension/room.group';
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
    async joinGroup(userId: number, socket: Socket): Promise<void> {
        let serivce: iGroupActions = container.resolve(GroupService);
        let groups = await serivce.getAllGroup(userId);
        for (let group of groups) {
            socket.join(getRoomGroupIO(group.groupId));
        }
    }

    private initConnection = (socket: Socket) => {
        const userId = socket.handshake.headers.userId
        this.joinGroup(Number(userId), socket);
        // DatabaseCache.getInstance().sadd(ConstantRedis.KEY_USER_ONLINE, String(userId))
        socket.on('disconnect', async () => {
            console.log("User disconnect" + socket.id)
            const userId = socket.handshake.headers.userId
            // DatabaseCache.getInstance().srem(ConstantRedis.KEY_USER_ONLINE, String(userId))
        })
        socket.on("typing", async (data: {
            groupId: number,
            userId: number
        }) => {
            socket.to(getRoomGroupIO(data.groupId)).except(socket.id).emit("typing", data.userId)
        })
        socket.on("typing_end", (data: {
            groupId: number,
            userId: number
        }) => {
            console.log("🚀 ~ file: socket.builder.ts:37 ~ SocketBuilder ~ data:", data)
            socket.to(getRoomGroupIO(data.groupId)).except(socket.id).emit("typing_end", data.userId)
        })
    }
}


