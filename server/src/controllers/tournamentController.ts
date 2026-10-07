import { Request, Response, NextFunction } from 'express';
import { Tournament } from '../models/Tournament';
import { sendSuccess } from '../utils/apiResponse';

export const getTournaments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { city, sport, status } = req.query;
    const query: any = {};
    if (city && city !== 'All') query.venueCity = new RegExp(`^${city}$`, 'i');
    if (sport) query.sport = sport;
    if (status) query.status = status;
    else query.status = { $in: ['registration_open', 'published', 'ongoing'] };

    const tournaments = await Tournament.find(query).sort({ startDate: 1 }).lean();
    const result = tournaments.map((t: any) => ({
      ...t,
      id: t.customId || t._id.toString(),
    }));
    sendSuccess(res, result, 'Tournaments retrieved');
  } catch (error) {
    next(error);
  }
};

export const getTournamentsByVenue = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { venueId } = req.params;
    const tournaments = await Tournament.find({ venueId }).sort({ startDate: 1 }).lean();
    const result = tournaments.map((t: any) => ({
      ...t,
      id: t.customId || t._id.toString(),
    }));
    sendSuccess(res, result, 'Venue tournaments retrieved');
  } catch (error) {
    next(error);
  }
};

export const getTournamentById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const tournament = await Tournament.findOne({
      $or: [{ customId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
    }).lean();

    if (!tournament) {
      return res.status(404).json({ success: false, message: 'Tournament not found' });
    }

    sendSuccess(res, {
      ...tournament,
      id: (tournament as any).customId || (tournament as any)._id.toString(),
    }, 'Tournament retrieved');
  } catch (error) {
    next(error);
  }
};

export const createTournament = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const customId = `tourn-${Date.now()}`;
    const ownerId = (req as any).user?.id || req.body.ownerId || 'owner-1';

    const tournament = await Tournament.create({
      ...req.body,
      customId,
      ownerId,
      currentParticipants: 0,
      registrations: [],
      publishedAt: new Date(),
    });

    sendSuccess(res, {
      ...tournament.toObject(),
      id: tournament.customId,
    }, 'Tournament created successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const registerForTournament = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { userId, userName, userEmail, teamName } = req.body;

    const tournament = await Tournament.findOne({
      $or: [{ customId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
    });

    if (!tournament) {
      return res.status(404).json({ success: false, message: 'Tournament not found' });
    }

    if (tournament.currentParticipants >= tournament.maxParticipants) {
      return res.status(400).json({ success: false, message: 'Tournament has reached maximum capacity.' });
    }

    const alreadyRegistered = tournament.registrations.some(
      (r: any) => r.userId === userId && r.status === 'registered'
    );
    if (alreadyRegistered) {
      return res.status(400).json({ success: false, message: 'User is already registered for this tournament.' });
    }

    const registration = {
      id: `reg-${Date.now()}`,
      tournamentId: tournament.customId,
      userId: userId || 'user-1',
      userName: userName || 'Player',
      userEmail,
      teamName,
      registeredAt: new Date(),
      status: 'registered' as const,
      paymentStatus: (tournament.entryFee > 0 ? 'pending' : 'paid') as 'pending' | 'paid',
      entryFeePaid: 0,
    };

    tournament.registrations.push(registration);
    tournament.currentParticipants = tournament.registrations.filter((r: any) => r.status === 'registered').length;
    await tournament.save();

    sendSuccess(res, {
      registration,
      tournament: {
        ...tournament.toObject(),
        id: tournament.customId,
      },
    }, 'Registered successfully');
  } catch (error) {
    next(error);
  }
};

export const cancelRegistration = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    const tournament = await Tournament.findOne({
      $or: [{ customId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
    });

    if (!tournament) {
      return res.status(404).json({ success: false, message: 'Tournament not found' });
    }

    const reg = tournament.registrations.find((r: any) => r.userId === userId);
    if (reg) {
      reg.status = 'cancelled';
      tournament.currentParticipants = tournament.registrations.filter((r: any) => r.status === 'registered').length;
      await tournament.save();
    }

    sendSuccess(res, { success: true }, 'Registration cancelled');
  } catch (error) {
    next(error);
  }
};
