import { Request, Response } from 'express';
import {  
  __TEST_ONLY_resetState,
  getRestaurants,
  joinQueue,
  leaveQueue,
  nextInQueue
} from '../controllers/queueController';

// --- MOCK do Socket.io ---
const mockEmit = jest.fn();
jest.mock('../sockets/socket', () => ({
  getIO: jest.fn(() => ({
    emit: mockEmit,
  })),
}));


describe('Queue Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let responseObject: any;
  
  beforeEach(() => {
    // 1. Reseta os dados (queue, userQueue)
    __TEST_ONLY_resetState();

    // 2. Limpa o histórico de chamadas do mock do socket
    mockEmit.mockClear();

    // 3. Prepara os objetos mock de request/response
    mockRequest = {};
    responseObject = {};
    mockResponse = {
      status: jest.fn().mockImplementation((code) => {
        responseObject.statusCode = code;
        return {
          json: jest.fn().mockImplementation((result) => {
            responseObject.body = result;
          }),
        };
      }),
      json: jest.fn().mockImplementation((result) => {
        responseObject.body = result;
      }),
    };
  });

  // Testes para getRestaurants
  describe('getRestaurants', () => {
    it('deve retornar a lista de restaurantes com status 200', () => {
      getRestaurants(mockRequest as Request, mockResponse as Response);
      expect(mockResponse.json).toHaveBeenCalled();
      expect(responseObject.body).toBeInstanceOf(Array);
      expect(responseObject.body.length).toBeGreaterThan(0);
    });
  });


  // Testes para joinQueue
  describe('joinQueue', () => {
    it('deve adicionar um usuário a uma fila existente', () => {
      mockRequest.body = { UserId: 999, IdRestaurant: 2 }; // Restaurante 2 já tem fila
      joinQueue(mockRequest as Request, mockResponse as Response);

      expect(responseObject.statusCode).toBe(201);
      expect(responseObject.body.message).toBe('Usuário adicionado à fila');
      expect(mockEmit).toHaveBeenCalledWith('queue:update', expect.any(Object));
    });

    it('deve retornar erro 403 se o usuário já estiver em uma fila', () => {
      mockRequest.body = { UserId: 101, IdRestaurant: 1 }; // Usuário 101 já existe
      joinQueue(mockRequest as Request, mockResponse as Response);

      expect(responseObject.statusCode).toBe(403);
      expect(responseObject.body.message).toBe('Usuário já está em uma fila');
      expect(mockEmit).not.toHaveBeenCalled();
    });

    it('deve criar uma nova fila se o restaurante não tiver uma e adicionar o usuário', () => {
      const newRestaurantId = 1; // ID de um restaurante que não tem fila
      mockRequest.body = { UserId: 999, IdRestaurant: newRestaurantId };

      joinQueue(mockRequest as Request, mockResponse as Response);

      const newQueue = responseObject.body.queue.find((q: any) => q.IdRestaurant === newRestaurantId);

      expect(responseObject.statusCode).toBe(201);
      expect(newQueue).toBeDefined();
      expect(newQueue.ActualOccupation).toBe(1);
      expect(mockEmit).toHaveBeenCalled();
    });
  });

  // Testes para nextInQueue
  describe('nextInQueue', () => {
    it('deve avançar a fila e emitir um evento de atualização', () => {
      mockRequest.body = { restaurantId: 2 };
      nextInQueue(mockRequest as Request, mockResponse as Response);

      expect(responseObject.body.message).toContain('chamou a posição');
      expect(mockEmit).toHaveBeenCalledWith('queue:update', expect.any(Object));
    });

    it('deve retornar erro se a fila já estiver no último cliente', () => {
      mockRequest.body = { restaurantId: 1 };

      const newRestaurantId = 1; // ID de um restaurante que não tem fila
      mockRequest.body = { UserId: 999, IdRestaurant: newRestaurantId };

      joinQueue(mockRequest as Request, mockResponse as Response);

      let Maxcount = Number(2), i = Number(0);
      while (i < Maxcount) {
        nextInQueue(mockRequest as Request, mockResponse as Response);
        i++;
      }
      expect(responseObject.statusCode).toBe(404);
      expect(responseObject.body.message).toContain('Nenhuma fila para avançar ou já está no último cliente');
    });

    it('deve retornar erro se a fila do restaurante não existir', () => {
      mockRequest.body = { restaurantId: 1 }; // Restaurante sem fila
      nextInQueue(mockRequest as Request, mockResponse as Response);

      expect(responseObject.statusCode).toBe(404);
      expect(responseObject.body.message).toContain('Nenhuma fila para avançar');
    });
  });

  // Testes para leaveQueue
  describe('leaveQueue', () => {
    it('deve remover um usuário da fila e emitir um evento de atualização', () => {
      mockRequest.body = { UserId: 101 }; // Usuário no início da fila
      leaveQueue(mockRequest as Request, mockResponse as Response);

      expect(responseObject.body.message).toContain('removido da fila');
      expect(mockEmit).toHaveBeenCalledWith('queue:update', expect.any(Object));
    });

    it('deve retornar erro 404 se o usuário não for encontrado na fila', () => {
      mockRequest.body = { UserId: 888 }; // Usuário não existe
      leaveQueue(mockRequest as Request, mockResponse as Response);

      expect(responseObject.statusCode).toBe(404);
      expect(responseObject.body.message).toBe('Usuário não encontrado em nenhuma fila.');
    });
  });
});