import { Router } from 'express';
import { getQueue, joinQueue, nextInQueue } from '../controllers/queueController';

const router: Router = Router();

router.get('/queue', getQueue);
router.post('/queue', joinQueue);
router.post('/queue/next', nextInQueue);

export default router;
