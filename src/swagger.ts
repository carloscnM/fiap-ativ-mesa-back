import swaggerJsdoc from 'swagger-jsdoc';
import path from 'path';

// process.cwd() retorna o diretório raiz do projeto (onde está o seu package.json)
// path.join() monta o caminho de forma segura para qualquer sistema operacional
const routesPath = path.join(process.cwd(), 'src', 'routes', '*.ts');

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Fila - Teste Mínimo',
      version: '1.0.0',
    },
    tags: [
        {
            name: 'Restaurantes',
            description: 'Operações relacionadas aos restaurantes'
        }
    ],
  },
  // Usamos o caminho absoluto e robusto que acabámos de criar
  apis: [routesPath],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;