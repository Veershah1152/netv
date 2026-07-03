import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { createParty, getPartyDetails, deactivateParty } from '../controllers/party.controller';

const router = Router();

// Secure create and deactivate endpoints
router.post('/create', requireAuth, createParty);
router.get('/details/:partyId', getPartyDetails); // anyone with invite link (logged-in or not, but requires code check) can join
router.put('/deactivate/:partyId', requireAuth, deactivateParty);

export default router;
