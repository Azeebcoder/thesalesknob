// Maps service catalog endpoints to their controllers and administrator guard.
import { Router } from 'express'
import { createService, deleteService, listServices, updateService } from '../controllers/servicesController.js'
import { requireRole } from '../middleware/requireAdmin.js'

const router = Router()

router.get('/', listServices)
router.post('/', requireRole('admin'), createService)
router.patch('/:id', requireRole('admin'), updateService)
router.delete('/:id', requireRole('admin'), deleteService)

export default router
