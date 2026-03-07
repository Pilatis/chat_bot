import { Router } from 'express';
import { AssistantController } from './assistant.controller';
import { authMiddleware } from '../../middlewares/authMiddleware';
import { companyMiddleware } from '../../middlewares/companyMiddleware';

const router = Router();
const assistantController = new AssistantController();

router.use(authMiddleware);

router.get('/:companyId/assistants', companyMiddleware, assistantController.listByCompany);
router.post('/:companyId/assistants', companyMiddleware, assistantController.create);
router.put('/:companyId/assistants/:assistantId', companyMiddleware, assistantController.update);
router.delete('/:companyId/assistants/:assistantId', companyMiddleware, assistantController.delete);

export default router;
