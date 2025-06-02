import http from 'http';
import app from './app';
import { setupWebSocket } from './sockets/socket';

const server = http.createServer(app);
setupWebSocket(server);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
