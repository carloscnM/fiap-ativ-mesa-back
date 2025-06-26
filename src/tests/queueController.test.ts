import { Request, Response } from 'express';
import { 
  getRestaurants, 
  getQueue, 
  getUserQueue, 
  joinQueue, 
  nextInQueue, 
  leaveQueue,  
  __TEST_ONLY_resetState 
} from '../controllers/queueController';
import { getIO } from '../sockets/socket';

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
    // ANTES de CADA teste, resetamos o estado do controller
    __TEST_ONLY_resetState();

    // Limpamos qualquer chamada anterior ao nosso mock de socket
    mockEmit.mockClear();
    
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

  // Testes para getQueue
  describe('getQueue', () => {
    it('deve retornar a fila atual com status 200', () => {
        getQueue(mockRequest as Request, mockResponse as Response);
        expect(mockResponse.json).toHaveBeenCalled();
        expect(responseObject.body).toBeInstanceOf(Array);
    });
  });

  // Testes para getUserQueue
  describe('getUserQueue', () => {
    it('deve retornar os usuários na fila com status 200', () => {
        getUserQueue(mockRequest as Request, mockResponse as Response);
        expect(mockResponse.json).toHaveBeenCalled();
        expect(responseObject.body).toBeInstanceOf(Array);
    });
  });

  // Testes para joinQueue
  describe('joinQueue', () => {
    it('deve adicionar um usuário à fila e emitir um evento de atualização', () => {
      mockRequest.body = { UserId: 999, IdRestaurant: 2 };
      joinQueue(mockRequest as Request, mockResponse as Response);
      expect(responseObject.statusCode).toBe(201);
      expect(responseObject.body.message).toBe('Usuário adicionado à fila');
      expect(mockEmit).toHaveBeenCalledWith('queue:update', expect.any(Object));
    });

    it('deve retornar erro 403 se o usuário já estiver em uma fila', () => {
        mockRequest.body = { UserId: 101, IdRestaurant: 1 };
        joinQueue(mockRequest as Request, mockResponse as Response);
        expect(responseObject.statusCode).toBe(403);
        expect(responseObject.body.message).toBe('Usuário já está em uma fila');
        expect(mockEmit).not.toHaveBeenCalled();
    });
  });

  // Testes para nextInQueue
  describe('nextInQueue', () => {
    it('deve avançar a fila e emitir um evento de atualização', () => {
      mockRequest.body = { restaurantId: 2 };
      nextInQueue(mockRequest as Request, mockResponse as Response);
      expect(mockResponse.json).toHaveBeenCalled();
      expect(mockEmit).toHaveBeenCalledWith('queue:update', expect.any(Object));
    });

    it('deve retornar erro 404 se não houver fila para avançar', () => {
        mockRequest.body = { restaurantId: 99 };
        nextInQueue(mockRequest as Request, mockResponse as Response);
        expect(responseObject.statusCode).toBe(404);
        expect(responseObject.body.message).toContain('Nenhuma fila para avançar');
        expect(mockEmit).not.toHaveBeenCalled();
    });
  });

  // Testes para leaveQueue
  describe('leaveQueue', () => {
    it('deve remover um usuário da fila e emitir um evento de atualização', () => {
      mockRequest.body = { UserId: 102 };
      leaveQueue(mockRequest as Request, mockResponse as Response);
      expect(mockResponse.json).toHaveBeenCalled();
      expect(responseObject.body.message).toContain('removido da fila');
      expect(mockEmit).toHaveBeenCalledWith('queue:update', expect.any(Object));
    });

    it('deve retornar erro 404 se o usuário não for encontrado na fila', () => {
        mockRequest.body = { UserId: 888 };
        leaveQueue(mockRequest as Request, mockResponse as Response);
        expect(responseObject.statusCode).toBe(404);
        expect(responseObject.body.message).toBe('Usuário não encontrado em nenhuma fila.');
        expect(mockEmit).not.toHaveBeenCalled();
    });
  });
});