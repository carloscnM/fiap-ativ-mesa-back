import express, { Application } from 'express';
import cors from 'cors';
import routes from './routes';
import swaggerUi from 'swagger-ui-express';
// Importe diretamente o nosso objeto de especificação
import swaggerSpec from './swagger';

const app: Application = express();

app.use(cors());
app.use(express.json());

// A rota da documentação usa o objeto de especificação diretamente
// Não precisamos mais do swagger-jsdoc aqui
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Suas rotas da API
app.use('/api', routes);

export default app;