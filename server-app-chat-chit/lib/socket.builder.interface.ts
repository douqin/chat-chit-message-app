import { Server } from 'socket.io';

interface iSocketBuilder {
    initializeBaseSocket(io: Server): iSocketBuilder;
    initializeMiddleware(): iSocketBuilder;
    initializeServer(): iSocketBuilder;
    reBuild(): void;
}

export default iSocketBuilder;