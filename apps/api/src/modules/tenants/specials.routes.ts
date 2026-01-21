import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { tenantContext } from '../../middleware/tenant.middleware';
import { prisma } from '../../db/client';

const router = Router();

router.use(authenticate);
router.use(tenantContext);

// Get all specials
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const specials = await prisma.special.findMany({
      where: { tenantId: req.user!.tenantId },
      orderBy: { createdAt: 'desc' },
    });
    res.json(specials);
  } catch (error) {
    next(error);
  }
});

// Create special
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const special = await prisma.special.create({
      data: {
        tenantId: req.user!.tenantId,
        ...req.body,
      },
    });
    res.status(201).json(special);
  } catch (error) {
    next(error);
  }
});

// Update special
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const special = await prisma.special.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(special);
  } catch (error) {
    next(error);
  }
});

// Delete special
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.special.delete({
      where: { id: req.params.id },
    });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
