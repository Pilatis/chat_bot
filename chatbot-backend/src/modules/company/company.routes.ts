import { Router } from 'express';
import { CompanyController } from './company.controller';
import { authMiddleware } from '../../middlewares/authMiddleware';
import { companyMiddleware } from '../../middlewares/companyMiddleware';

const router = Router();
const companyController = new CompanyController();

router.use(authMiddleware);

router.get('/', companyController.listCompanies);
router.post('/', companyController.createCompany);
router.get('/:companyId', companyMiddleware, companyController.getCompany);
router.put('/:companyId', companyMiddleware, companyController.updateCompany);

router.get('/:companyId/products', companyMiddleware, companyController.getProducts);
router.post('/:companyId/products', companyMiddleware, companyController.createProduct);
router.put('/:companyId/products/:productId', companyMiddleware, companyController.updateProduct);
router.delete('/:companyId/products/:productId', companyMiddleware, companyController.deleteProduct);

router.get('/:companyId/services', companyMiddleware, companyController.getServices);
router.post('/:companyId/services', companyMiddleware, companyController.createService);
router.put('/:companyId/services/:serviceId', companyMiddleware, companyController.updateService);
router.delete('/:companyId/services/:serviceId', companyMiddleware, companyController.deleteService);

router.get('/:companyId/stats', companyMiddleware, companyController.getCompanyStats);

export default router;
