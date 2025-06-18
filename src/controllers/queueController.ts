import { Request, Response } from 'express';
import { getIO } from '../sockets/socket';

// --- INTERFACES ---
interface UserQueue {
  QueueId: number;
  UserId: number;
  Position: number;
}

export interface Restaurant {
  Id: number;
  Name: string;
  logoUrl: string;
  imageUrl: string; 
  description: string;
  address: string;
  estimatedWaitTimePerPerson: number;
}

interface User {
  id: number;
  name: string;
}

interface Queue {
  Id: number;
  IdRestaurant: number;
  ActualOccupation: number;
  ActualPosition: number;
}

// --- DADOS MOCKADOS ---
let restaurants: Restaurant[] = [
  // Seus dados de restaurante aqui...
  { 
    Id: 1, 
    Name: "Botequim Seu Jorge", 
    logoUrl: "https://ofuxico.com.br/img/upload/noticias/2013/04/10/168360_36.jpg",
    imageUrl: "https://ofuxico.com.br/img/upload/noticias/2013/04/10/168360_36.jpg",
    description: "O melhor da comida de boteco tradicional, com um toque de sofisticação. Cerveja sempre gelada e petiscos de dar água na boca.",
    address: "Rua das Flores, 123 - Centro",
    estimatedWaitTimePerPerson: 5, 
  },
  { 
    Id: 2, 
    Name: "Cantina da Nona", 
    logoUrl: "https://s2-g1.glbimg.com/JtRD4x-KQ39FzvOYjb4RbtAhjcE=/0x0:3000x2050/984x0/smart/filters:strip_icc()/i.s3.glbimg.com/v1/AUTH_59edd422c0c84a879bd37670ae4f538a/internal_photos/bs/2020/Z/7/SMAe3pQ3CefBwb9jK5QQ/palmirinha-iwi-onodera-3.jpg",
    imageUrl: "https://s2-g1.glbimg.com/JtRD4x-KQ39FzvOYjb4RbtAhjcE=/0x0:3000x2050/984x0/smart/filters:strip_icc()/i.s3.glbimg.com/v1/AUTH_59edd422c0c84a879bd37670ae4f538a/internal_photos/bs/2020/Z/7/SMAe3pQ3CefBwb9jK5QQ/palmirinha-iwi-onodera-3.jpg",
    description: "Massas frescas feitas com amor, seguindo as receitas secretas da nona. O verdadeiro sabor da Itália no coração da cidade.",
    address: "Avenida Principal, 456 - Bairro Italiano",
    estimatedWaitTimePerPerson: 15,
  }
];

let queue: Queue[] = [
  { Id: 1, IdRestaurant: 2, ActualOccupation: 3, ActualPosition: 1 }
];

let userQueue: UserQueue[] = [
  { QueueId: 1, UserId: 101, Position: 1},
  { QueueId: 1, UserId: 102, Position: 2 },
  { QueueId: 1, UserId: 103, Position: 3 },
];

let nextQueueId = 2;

// --- CONTROLLERS ---

export const getRestaurants = (req: Request, res: Response): void => {
  res.json(restaurants);
};

export const getQueue = (req: Request, res: Response): void => {
  res.json(queue);
};

export const getUserQueue = (req: Request, res: Response): void => {
  res.json(userQueue);
};

export const joinQueue = (req: Request, res: Response): void => {
  const { UserId, IdRestaurant } = req.body;
  const userIdnumber = Number(UserId);
  const restaurantIdnumber = Number(IdRestaurant);

  if (userQueue.some(uq => uq.UserId === userIdnumber)) {
    res.status(403).json({ message: 'Usuário já está em uma fila' });
    return;
  }

  let targetQueue = queue.find(q => q.IdRestaurant === restaurantIdnumber);

  if (!targetQueue) {
    const newQueue: Queue = {
      Id: nextQueueId,
      IdRestaurant: restaurantIdnumber,
      ActualOccupation: 0,
      ActualPosition: 1,
    };
    queue.push(newQueue);
    targetQueue = newQueue;
    nextQueueId++;
  }

  targetQueue.ActualOccupation += 1;

  const newUserInQueue: UserQueue = {
    QueueId: targetQueue.Id,
    UserId: userIdnumber,
    Position: targetQueue.ActualOccupation,
  };
  userQueue.push(newUserInQueue);

  getIO().emit('queue:update', { queues: queue, userQueues: userQueue });
  res.status(201).json({ message: 'Usuário adicionado à fila', queue });
};

/**
 * Simula o painel do restaurante chamando o próximo número.
 * Esta ação é geralmente feita por um administrador/funcionário do restaurante.
 */
export const nextInQueue = (req: Request, res: Response): void => {
  const { restaurantId } = req.body; // O ideal é saber qual fila avançar
  const queueToAdvance = queue.find(q => q.IdRestaurant === Number(restaurantId));

  if (queueToAdvance && queueToAdvance.ActualPosition < queueToAdvance.ActualOccupation) {
    queueToAdvance.ActualPosition += 1;
    getIO().emit('queue:update', { queues: queue, userQueues: userQueue });
    res.json({ message: `Restaurante ${restaurantId} chamou a posição ${queueToAdvance.ActualPosition}`, queue });
  } else {
    res.status(404).json({ message: 'Nenhuma fila para avançar ou já está no último cliente' });
  }
};


/**
 * NOVA FUNÇÃO: Remove um usuário da fila.
 * Esta ação pode ser iniciada pelo próprio usuário (desistiu) ou por um admin.
 */
export const leaveQueue = (req: Request, res: Response): void => {
  const { UserId } = req.body;
  const userIdnumber = Number(UserId);

  const userIndex = userQueue.findIndex(u => u.UserId === userIdnumber);

  // Verifica se o usuário realmente está em uma fila
  if (userIndex === -1) {
    res.status(404).json({ message: 'Usuário não encontrado em nenhuma fila.' });
    return;
  }

  const userWhoLeft = userQueue[userIndex];
  const queueId = userWhoLeft.QueueId;
  const positionOfUserWhoLeft = userWhoLeft.Position;

  // 1. Remove o usuário da lista de usuários na fila
  userQueue.splice(userIndex, 1);

  // 2. Encontra a fila principal para decrementar a ocupação
  const targetQueue = queue.find(q => q.Id === queueId);
  if (targetQueue) {
    targetQueue.ActualOccupation -= 1;

    // 3. CRÍTICO: Ajusta a posição de todos que estavam atrás do usuário que saiu
    userQueue.forEach(user => {
      if (user.QueueId === queueId && user.Position > positionOfUserWhoLeft) {
        user.Position -= 1;
      }
    });
  }

  // Emite a atualização para todos os clientes
  getIO().emit('queue:update', { queues: queue, userQueues: userQueue });

  res.json({ message: `Usuário ${userIdnumber} removido da fila.`, queue });
};