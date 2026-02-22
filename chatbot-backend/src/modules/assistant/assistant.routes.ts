import { Router } from 'express';
import { AssistantController } from './assistant.controller';
import { authMiddleware } from '../../middlewares/authMiddleware';

const router = Router();
const assistantController = new AssistantController();

router.use(authMiddleware);

router.get('/company/:companyId/assistant', assistantController.listByCompany);
router.post('/company/:companyId/assistant', assistantController.create);
router.put('/assistant/:assistantId', assistantController.update);
router.delete('/assistant/:assistantId', assistantController.delete);

export default router;
