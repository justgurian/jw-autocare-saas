import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { tenantContext } from '../../middleware/tenant.middleware';
import { prisma } from '../../db/client';

const router = Router();

router.use(authenticate);
router.use(tenantContext);

// Get all services
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const services = await prisma.service.findMany({
      where: { tenantId: req.user!.tenantId },
      orderBy: { sortOrder: 'asc' },
    });
    res.json(services);
  } catch (error) {
    next(error);
  }
});

// Create service
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const service = await prisma.service.create({
      data: {
        tenantId: req.user!.tenantId,
        ...req.body,
      },
    });
    res.status(201).json(service);
  } catch (error) {
    next(error);
  }
});

// Update service
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const service = await prisma.service.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(service);
  } catch (error) {
    next(error);
  }
});

// Delete service
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.service.delete({
      where: { id: req.params.id },
    });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
