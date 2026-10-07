import { Router } from 'express';
import * as tournamentController from '../controllers/tournamentController';

const router = Router();

router.get('/', tournamentController.getTournaments);
router.get('/venue/:venueId', tournamentController.getTournamentsByVenue);
router.get('/:id', tournamentController.getTournamentById);

router.post('/', tournamentController.createTournament);
router.post('/:id/register', tournamentController.registerForTournament);
router.post('/:id/cancel-registration', tournamentController.cancelRegistration);

export default router;
