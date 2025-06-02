import { Request, Response } from 'express';
import { getIO } from '../sockets/socket';

interface User {
  id: string;
  name: string;
}

let queue: User[] = [];

export const getQueue = (req: Request, res: Response): void => {
  res.json(queue);
};

export const joinQueue = (req: Request, res: Response): void => {
  const user: User = req.body;
  queue.push(user);
  getIO().emit('queue:update', queue);
  res.status(201).json({ message: 'Usuário adicionado à fila', queue });
};

export const nextInQueue = (req: Request, res: Response): void => {
  queue.shift();
  getIO().emit('queue:update', queue);
  res.json({ message: 'Próximo usuário chamado', queue });
};
