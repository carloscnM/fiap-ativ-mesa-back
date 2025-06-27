const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'API de Fila de Restaurante',
    version: '1.0.0',
    description: 'Documentação da API para o sistema de gerenciamento de filas de restaurantes.',
  },
  servers: [
    {
      url: 'http://localhost:3000/api',
      description: 'Servidor de Desenvolvimento'
    },
  ],
  tags: [
    { name: 'Restaurantes', description: 'Operações relacionadas aos restaurantes' },
    { name: 'Fila', description: 'Gerenciamento da fila de espera' }
  ],
  paths: {
    '/restaurants': {
      get: {
        tags: ['Restaurantes'],
        summary: 'Retorna a lista de todos os restaurantes',
        responses: {
          '200': { description: 'Sucesso. Retorna a lista de restaurantes.' }
        }
      }
    },
    '/queue': {
      get: {
        tags: ['Fila'],
        summary: 'Retorna as filas ativas',
        responses: {
          '200': {
            description: 'Sucesso. Retorna a lista de filas.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/Queue' } }
            }
          }
        }
      }
    },
    '/userQueue': {
        get: {
            tags: ['Fila'],
            summary: 'Retorna a lista de todos os usuários em todas as filas',
            responses: {
                '200': {
                    description: 'Sucesso. Retorna a lista de usuários na fila.',
                    content: {
                        'application/json': { schema: { $ref: '#/components/schemas/UserQueue' } }
                    }
                }
            }
        }
    },
    '/joinQueue': {
      post: {
        tags: ['Fila'],
        summary: 'Adiciona um usuário a uma fila de espera',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  UserId: { type: 'integer', example: 104 },
                  IdRestaurant: { type: 'integer', example: 2 }
                }
              }
            }
          }
        },
        responses: {
          '201': { description: 'Usuário adicionado com sucesso.' },
          '403': { description: 'Usuário já está em uma fila.' }
        }
      }
    },
    '/queue/next': {
        post: {
            tags: ['Fila'],
            summary: 'Avança a fila de um restaurante',
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                restaurantId: { type: 'integer', example: 2 }
                            }
                        }
                    }
                }
            },
            responses: {
                '200': { description: 'Fila avançada com sucesso.' },
                '404': { description: 'Fila não encontrada ou sem clientes para chamar.' }
            }
        }
    },
    '/leaveQueue': {
        post: {
            tags: ['Fila'],
            summary: 'Remove um usuário de uma fila',
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                UserId: { type: 'integer', example: 101 }
                            }
                        }
                    }
                }
            },
            responses: {
                '200': { description: 'Usuário removido com sucesso.' },
                '404': { description: 'Usuário não encontrado em nenhuma fila.' }
            }
        }
    }
  },
  components: {
    schemas: {
      Queue: {
        type: 'object',
        properties: {
          Id: { type: 'integer', example: 1 },
          IdRestaurant: { type: 'integer', example: 2 },
          ActualOccupation: { type: 'integer', example: 3 },
          ActualPosition: { type: 'integer', example: 1 },
        }
      },
      UserQueue: {
        type: 'object',
        properties: {
          QueueId: { type: 'integer', example: 1 },
          UserId: { type: 'integer', example: 101 },
          Position: { type: 'integer', example: 1 },
        }
      }
    }
  }
};

export default swaggerSpec;