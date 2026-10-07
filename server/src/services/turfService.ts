import { Turf } from '../models/Turf';
import { Slot } from '../models/Slot';

export interface TurfFilters {
  q?: string;
  sport?: string;
  city?: string;
  area?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  venueCategory?: string;
  onlyAvailable?: boolean;
}

export const getTurfs = async (filters: TurfFilters = {}) => {
  const query: any = { approvalStatus: 'APPROVED' };

  if (filters.city && filters.city !== 'All') {
    query.city = { $regex: new RegExp(`^${filters.city}$`, 'i') };
  }

  if (filters.area && filters.area !== 'All Areas') {
    query.area = { $regex: new RegExp(filters.area, 'i') };
  }

  if (filters.sport) {
    query.sports = { $in: [filters.sport.toLowerCase()] };
  }

  if (filters.venueCategory) {
    query.venueCategory = filters.venueCategory;
  }

  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    query.pricePerHour = {};
    if (filters.minPrice !== undefined) query.pricePerHour.$gte = Number(filters.minPrice);
    if (filters.maxPrice !== undefined) query.pricePerHour.$lte = Number(filters.maxPrice);
  }

  if (filters.minRating !== undefined) {
    query.rating = { $gte: Number(filters.minRating) };
  }

  if (filters.onlyAvailable) {
    query.available = true;
  }

  if (filters.q) {
    const searchRegex = new RegExp(filters.q, 'i');
    query.$or = [
      { name: searchRegex },
      { city: searchRegex },
      { area: searchRegex },
      { sports: { $in: [searchRegex] } },
      { description: searchRegex },
    ];
  }

  const turfs = await Turf.find(query).sort({ rating: -1, trustScore: -1 }).lean();
  return turfs.map((t: any) => ({
    ...t,
    id: t.customId || t._id.toString(),
  }));
};

export const getTurfById = async (id: string) => {
  const turf = await Turf.findOne({
    $or: [{ customId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
  }).lean();

  if (!turf) {
    throw new Error(`Turf with ID ${id} not found`);
  }

  return {
    ...turf,
    id: (turf as any).customId || (turf as any)._id.toString(),
  };
};

export const getNearbyTurfs = async (lat: number, lng: number, radiusKm: number = 25) => {
  // 1 radian is approx 6378.1 km
  const radiusInRadians = radiusKm / 6378.1;

  const turfs = await Turf.find({
    approvalStatus: 'APPROVED',
    location: {
      $geoWithin: {
        $centerSphere: [[lng, lat], radiusInRadians],
      },
    },
  }).lean();

  return turfs.map((t: any) => {
    // Haversine distance
    const dLat = (t.latitude - lat) * (Math.PI / 180);
    const dLon = (t.longitude - lng) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat * (Math.PI / 180)) * Math.cos(t.latitude * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = Math.round(6371 * c * 10) / 10;

    return {
      ...t,
      id: t.customId || t._id.toString(),
      distance,
    };
  }).sort((a: any, b: any) => (a.distance ?? 0) - (b.distance ?? 0));
};

export const getTurfsByOwner = async (ownerId: string) => {
  const turfs = await Turf.find({ ownerId }).sort({ createdAt: -1 }).lean();
  return turfs.map((t: any) => ({
    ...t,
    id: t.customId || t._id.toString(),
  }));
};

export const createTurf = async (data: any, ownerId: string) => {
  const customId = `turf-${Date.now()}`;
  const coordinates = [data.longitude || 77.2090, data.latitude || 28.6139];

  const newTurf = new Turf({
    ...data,
    customId,
    ownerId,
    location: {
      type: 'Point',
      coordinates,
    },
    rating: 5.0,
    reviewsCount: 0,
    approvalStatus: 'APPROVED',
    verified: true,
  });

  await newTurf.save();
  return {
    ...newTurf.toObject(),
    id: newTurf.customId,
  };
};

export const updateTurf = async (id: string, data: any, ownerId: string) => {
  const turf = await Turf.findOne({
    $or: [{ customId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
  });

  if (!turf) {
    throw new Error(`Turf ${id} not found`);
  }

  // Allow owner or admin
  if (turf.ownerId !== ownerId && ownerId !== 'admin-1') {
    throw new Error('Not authorized to update this turf');
  }

  Object.assign(turf, data);
  if (data.latitude && data.longitude) {
    turf.location = {
      type: 'Point',
      coordinates: [data.longitude, data.latitude],
    };
  }

  await turf.save();
  return {
    ...turf.toObject(),
    id: turf.customId,
  };
};

export const checkSlotAvailability = async (turfId: string, date: string, startTime: string) => {
  const slot = await Slot.findOne({
    turfId,
    date,
    startTime,
  });

  if (!slot) {
    return { available: true };
  }

  if (slot.status === 'held' && slot.heldUntil && slot.heldUntil < new Date()) {
    return { available: true };
  }

  return { available: slot.status === 'available' };
};
