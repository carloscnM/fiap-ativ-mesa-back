import express, { Application } from 'express';
import cors from 'cors';
import routes from './routes';
import swaggerUi from 'swagger-ui-express';
// Importe a configuração do novo arquivo
import swaggerSpec from './swagger';

const app: Application = express();

app.use(cors());
app.use(express.json());

// A rota da documentação agora usa a especificação importada
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Suas rotas da API
app.use('/api', routes);

export default app;