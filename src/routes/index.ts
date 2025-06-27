import { Router } from 'express';
import { getQueue, joinQueue, nextInQueue, getRestaurants, leaveQueue, getUserQueue } from '../controllers/queueController';

const router: Router = Router();

router.get('/restaurants', getRestaurants);
router.get('/queue', getQueue);
router.get('/userQueue', getUserQueue);
router.post('/joinQueue', joinQueue);
router.post('/queue/next', nextInQueue);
router.post('/leaveQueue', leaveQueue);

export default router;