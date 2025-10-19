import { Router } from 'express';
import { CompanyController } from './company.controller';
import { authMiddleware } from '../../middlewares/authMiddleware';

const router = Router();
const companyController = new CompanyController();

// Todas as rotas de empresa requerem autenticação
router.use(authMiddleware);

// Rotas da empresa
router.get('/', companyController.getCompany);
router.post('/', companyController.createOrUpdateCompany);

// Rotas de produtos
router.get('/:companyId/products', companyController.getProducts);
router.post('/:companyId/products', companyController.createProduct);
router.put('/products/:productId', companyController.updateProduct);
router.delete('/products/:productId', companyController.deleteProduct);

// Estatísticas
router.get('/:companyId/stats', companyController.getCompanyStats);

export default router;
