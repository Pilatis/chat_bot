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

// Rotas de serviços
router.get('/:companyId/services', companyController.getServices);
router.post('/:companyId/services', companyController.createService);
router.put('/services/:serviceId', companyController.updateService);
router.delete('/services/:serviceId', companyController.deleteService);

// Estatísticas
router.get('/:companyId/stats', companyController.getCompanyStats);

export default router;
