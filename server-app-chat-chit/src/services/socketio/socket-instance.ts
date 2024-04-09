import { Subscription } from "rxjs";
import { singleton } from "tsyringe";
import { SocketIoService } from "./socket-serivce";
import { Server, Socket } from "socket.io";
import { getRoomGroupIO } from "@/utils/extension/room.group";
import { iGroupActions } from "@/resources/group/interface/group.service.interface";
import GroupService from "@/resources/group/group.service";
import { globalContainer } from "@/lib/common";

@singleton()
export class SocketIo {
  private eventSubscription: Subscription;
  constructor(private readonly service: SocketIoService) {}
  afterInit(server: Server): void {
    this.eventSubscription = this.service.getEventSubject$().subscribe({
      next: (event) => server.emit(event.name, event.data),
      error: (err) => server.emit("exception", err),
    });
  }
  onApplicationShutdown() {
    this.eventSubscription.unsubscribe();
  }
  private initConnection = (socket: Socket) => {
    const userId = socket.handshake.headers.userId;
    this.joinGroup(Number(userId), socket);
    // DatabaseCache.getInstance().sadd(ConstantRedis.KEY_USER_ONLINE, String(userId))
    socket.on("disconnect", async () => {
      console.log("User disconnect" + socket.id);
      const userId = socket.handshake.headers.userId;
      // DatabaseCache.getInstance().srem(ConstantRedis.KEY_USER_ONLINE, String(userId))
    });
    socket.on("typing", async (data: { groupId: number; userId: number }) => {
      socket
        .to(getRoomGroupIO(data.groupId))
        .except(socket.id)
        .emit("typing", data.userId);
    });
    socket.on("typing_end", (data: { groupId: number; userId: number }) => {
      console.log(
        "🚀 ~ file: socket.builder.ts:37 ~ SocketBuilder ~ data:",
        data
      );
      socket
        .to(getRoomGroupIO(data.groupId))
        .except(socket.id)
        .emit("typing_end", data.userId);
    });
  };
  async joinGroup(userId: number, socket: Socket): Promise<void> {
    let serivce: iGroupActions = globalContainer.resolve(GroupService);
    let room = await serivce.getAllRoom(userId);
    await socket.join(room);
  }
}
