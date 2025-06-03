import { Request, Response } from 'express';
import { getIO } from '../sockets/socket';

interface UserQueue {
  QueueId: bigint;
  UserId: bigint;
  Position: bigint;
}

interface Restaurant {
  Id: bigint;
  Name: string;
}

interface User {
  id: bigint;
  name: string;
}

interface Queue {
  Id: bigint;
  IdRestaurant: bigint;
  ActualOccupation: bigint;
  ActualPosition: bigint;
}

let restaurants = [{ Id: 1, Name: "Botequim Seu Jorge" }];
let queue: Queue[] = [];
let UserQueue: UserQueue[] = [];

export const getQueue = (req: Request, res: Response): void => {
  res.json(queue);
};

export const getRestaurants = (req: Request, res: Response): void => {
  res.json(restaurants);
};

export const joinQueue = (req: Request, res: Response): void => {

  if (UserQueue.some(uq => uq.UserId === req.body.UserId)) {
    res.status(403).json({ message: 'Usuário já está em uma fila', queue });
  }
  else {

    var queueId: number = 0;
    if (queue.length > 0) {
      queueId = queue.findIndex(q => q.IdRestaurant = req.body.IdRestaurant);

      if (queueId == undefined || queueId == 0) {
        let id = queue.sort((a, b) => -(a > b) || +(a < b)).reverse()[0].Id + 1n;
        let actualOccupation = queue.sort((a, b) => -(a > b) || +(a < b)).reverse()[0].ActualOccupation + 1n
        let q: Queue =
          { Id: id, IdRestaurant: req.body.IdRestaurant, ActualOccupation: actualOccupation, ActualPosition: 0n };
        queue.push(q);
      }
    }
    else {
      let q: Queue =
        { Id: 1n, IdRestaurant: req.body.IdRestaurant, ActualOccupation: 0n, ActualPosition: 0n };
      queue.push(q);
    }
    queue[queueId].ActualOccupation += 1n;
    const user: User = req.body;

    queue.push(user);
    getIO().emit('queue:update', queue);
    res.status(201).json({ message: 'Usuário adicionado à fila', queue });
  }

};

export const nextInQueue = (req: Request, res: Response): void => {
  queue.shift();
  getIO().emit('queue:update', queue);
  res.json({ message: 'Próximo usuário chamado', queue });
};
