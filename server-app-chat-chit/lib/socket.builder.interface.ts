import { Server } from 'socket.io';

interface iSocketBuilder {
    intializeBaseSocket(io: Server): iSocketBuilder;
    initalizeMiddleware(): iSocketBuilder;
    initalizeServer(): iSocketBuilder;
    reBuild(): void;
}

export default iSocketBuilder;