import { Router } from 'express';
import { onboardingController } from './onboarding.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { tenantContext } from '../../middleware/tenant.middleware';

const router = Router();

// All onboarding routes require authentication and tenant context
router.use(authenticate);
router.use(tenantContext);

// Get onboarding status
router.get('/status', onboardingController.getStatus);

// Get brand kit
router.get('/brand-kit', onboardingController.getBrandKit);

// Step-by-step onboarding
router.post('/step/1', onboardingController.updateBusinessInfo);
router.post('/step/2/logo', onboardingController.uploadLogo);
router.post('/step/2/colors', onboardingController.updateColors);
router.post('/step/3', onboardingController.addServices);
router.post('/step/4', onboardingController.updateBrandVoice);
router.post('/step/5', onboardingController.addSpecials);
router.post('/step/6', onboardingController.setDefaultVehicle);

// Complete onboarding
router.post('/complete', onboardingController.complete);

export default router;
