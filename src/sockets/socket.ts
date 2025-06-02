import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';

interface User {
  id: string;
  name: string;
}

let io: SocketIOServer;
let queue: User[] = [];

export function setupWebSocket(server: HttpServer): void {
  io = new SocketIOServer(server, {
    cors: {
      origin: '*',
    },
  });

  io.on('connection', (socket: Socket) => {
    console.log('Novo cliente conectado:', socket.id);

    socket.emit('queue:update', queue);

    socket.on('queue:join', (user: User) => {
      queue.push(user);
      io.emit('queue:update', queue);
    });

    socket.on('queue:next', () => {
      queue.shift();
      io.emit('queue:update', queue);
    });

    socket.on('disconnect', () => {
      console.log('Cliente desconectado:', socket.id);
    });
  });
}

export function getIO(): SocketIOServer {
  if (!io) {
    throw new Error('Socket.io não foi inicializado');
  }
  return io;
}
