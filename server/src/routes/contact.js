// Maps public enquiry and administrator inbox endpoints to their controllers.
import { Router } from 'express'
import { createContact, listContacts, markContactReviewed } from '../controllers/contactController.js'
import { requireRole } from '../middleware/requireAdmin.js'

const router = Router()

router.post('/', createContact)
router.get('/', requireRole('admin'), listContacts)
router.patch('/:id/reviewed', requireRole('admin'), markContactReviewed)

export default router
