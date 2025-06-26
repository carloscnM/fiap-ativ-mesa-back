import { Router } from 'express';
import { getQueue, joinQueue, nextInQueue, getRestaurants, leaveQueue, getUserQueue } from '../controllers/queueController';

const router: Router = Router();

/**
 * @swagger
 * /restaurants:
 * get:
 * tags: [Restaurantes]
 * summary: Retorna a lista de todos os restaurantes
 * description: Retorna um array com todos os restaurantes disponíveis.
 * responses:
 * '200':
 * description: Sucesso.
 * content:
 * application/json:
 * schema:
 * type: array
 * items:
 * type: object
 */
router.get('/restaurants', getRestaurants);


// O resto das rotas funcionará normalmente, mas não será documentado por enquanto.
router.get('/queue', getQueue);
router.get('/userQueue', getUserQueue);
router.post('/joinQueue', joinQueue);
router.post('/queue/next', nextInQueue);
router.post('/leaveQueue', leaveQueue);

export default router;