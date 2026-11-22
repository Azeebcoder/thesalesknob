// Maps administrator authentication endpoints to their controllers.
import { Router } from 'express'
import { getCurrentAdmin, login, logout } from '../controllers/authController.js'

const router = Router()

router.post('/login', login)
router.get('/me', getCurrentAdmin)
router.post('/logout', logout)

export default router
