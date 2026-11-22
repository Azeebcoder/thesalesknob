// Maps public CMS and administrator content endpoints to their controllers.
import { Router } from 'express'
import {
  createEntry,
  deleteEntry,
  getPublishedEntry,
  listManagedEntries,
  listPublishedEntries,
  updateEntry,
} from '../controllers/contentController.js'
import { requireAdmin } from '../middleware/requireAdmin.js'

const router = Router()

router.get('/manage', requireAdmin, listManagedEntries)
router.get('/', listPublishedEntries)
router.get('/:collection/:slug', getPublishedEntry)
router.post('/', requireAdmin, createEntry)
router.patch('/:id', requireAdmin, updateEntry)
router.delete('/:id', requireAdmin, deleteEntry)

export default router
