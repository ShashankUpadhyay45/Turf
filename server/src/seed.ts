import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

import { User } from './models/User';
import { Turf } from './models/Turf';
import { Slot } from './models/Slot';
import { Booking } from './models/Booking';
import { Review } from './models/Review';
import { Tournament } from './models/Tournament';
import { SupportTicket } from './models/SupportTicket';

dotenv.config();

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/playo_turf';

const seedDatabase = async () => {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB Atlas.');

    // 1. Load seed data JSON
    const dataPath = path.resolve('src/data/seedData.json');
    if (!fs.existsSync(dataPath)) {
      throw new Error(`seedData.json not found at ${dataPath}. Please run prepareData script first.`);
    }
    const seedData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

    // 2. Clear collections
    console.log('Clearing existing collections...');
    await Promise.all([
      User.deleteMany({}),
      Turf.deleteMany({}),
      Slot.deleteMany({}),
      Booking.deleteMany({}),
      Review.deleteMany({}),
      Tournament.deleteMany({}),
      SupportTicket.deleteMany({}),
    ]);
    console.log('✅ Cleared old collections.');

    // 3. Seed Users
    console.log('Seeding users and owner accounts...');
    const usersToInsert = [];
    for (const u of seedData.users) {
      let plainPassword = 'owner123';
      if (u.role === 'player') plainPassword = 'player123';
      else if (u.role === 'admin') plainPassword = 'admin123';
      else if (u.email && u.email.includes('game') || u.email.includes('fun')) plainPassword = 'gaming123';

      const passwordHash = await bcrypt.hash(plainPassword, 10);
      usersToInsert.push({
        customId: u.id,
        name: u.name,
        email: u.email.toLowerCase(),
        phone: u.phone,
        passwordHash,
        role: u.role,
        membershipTier: u.membershipTier || 'free',
        rewardBalance: u.rewardPoints || (u.role === 'player' ? 2450 : 0),
        city: u.city,
        isActive: u.isActive !== undefined ? u.isActive : true,
      });
    }
    const insertedUsers = await User.insertMany(usersToInsert);
    console.log(`✅ Seeded ${insertedUsers.length} users and owners.`);

    // 4. Seed Turfs and Gaming Zones
    console.log('Seeding turfs and gaming zones...');
    const turfsToInsert = seedData.turfs.map((t: any) => ({
      customId: t.id,
      ownerId: t.ownerId || 'owner-1',
      ownerName: t.ownerName,
      name: t.name,
      blurb: t.blurb,
      description: t.description,
      sports: t.sports || ['football'],
      venueCategory: t.venueCategory || 'sports_turf',
      area: t.area,
      city: t.city,
      pincode: t.pincode,
      address: t.address,
      latitude: t.latitude || 28.6139,
      longitude: t.longitude || 77.2090,
      location: {
        type: 'Point',
        coordinates: [t.longitude || 77.2090, t.latitude || 28.6139],
      },
      distance: t.distance || 1.5,
      rating: t.rating || 4.8,
      reviewsCount: t.reviewsCount || 45,
      pricePerHour: t.pricePerHour || 600,
      peakPricePerHour: t.peakPricePerHour || Math.round((t.pricePerHour || 600) * 1.25),
      weekendPricePerHour: t.weekendPricePerHour || Math.round((t.pricePerHour || 600) * 1.2),
      verified: t.verified !== undefined ? t.verified : true,
      verificationStatus: t.verificationStatus || 'VERIFIED',
      imageVerified: t.imageVerified !== undefined ? t.imageVerified : true,
      amenities: t.amenities || ['Parking', 'Drinking water', 'Changing room'],
      image: typeof t.image === 'string' ? t.image : '/assets/turf-champions.webp',
      images: Array.isArray(t.images) && t.images.length > 0 ? t.images : ['/assets/turf-champions.webp'],
      available: t.available !== undefined ? t.available : true,
      placeId: t.placeId,
      operatingHours: t.operatingHours || { open: '06:00 AM', close: '11:00 PM' },
      approvalStatus: t.approvalStatus || 'APPROVED',
      trustScore: t.trustScore || 95,
      accuracyScore: t.accuracyScore || 96,
      indoorOutdoor: t.indoorOutdoor || (t.venueCategory === 'gaming_zone' ? 'indoor' : 'outdoor'),
      bookingUnit: t.bookingUnit || 'per_hour',
      cancellationPolicy: t.cancellationPolicy,
      gamingActivities: t.gamingActivities || [],
      videos: t.videos || [],
    }));
    const insertedTurfs = await Turf.insertMany(turfsToInsert);
    console.log(`✅ Seeded ${insertedTurfs.length} venues.`);

    // 5. Seed Tournaments
    console.log('Seeding tournaments...');
    const tournamentsToInsert = seedData.tournaments.map((t: any) => ({
      customId: t.id,
      venueId: t.venueId,
      ownerId: t.ownerId || 'owner-1',
      title: t.title,
      description: t.description,
      category: t.category,
      sport: t.sport,
      eventType: t.eventType || 'tournament',
      format: t.format,
      startDate: t.startDate,
      endDate: t.endDate,
      startTime: t.startTime,
      endTime: t.endTime,
      registrationDeadline: t.registrationDeadline,
      entryFee: t.entryFee || 0,
      prizePool: t.prizePool || 0,
      maxParticipants: t.maxParticipants || 16,
      currentParticipants: t.currentParticipants || 4,
      status: t.status || 'registration_open',
      venueName: t.venueName,
      venueCity: t.venueCity,
      venueArea: t.venueArea,
      rules: t.rules,
      contactEmail: t.contactEmail,
      publishedAt: new Date(),
    }));
    const insertedTournaments = await Tournament.insertMany(tournamentsToInsert);
    console.log(`✅ Seeded ${insertedTournaments.length} tournaments.`);

    // 6. Seed Support Tickets
    console.log('Seeding support tickets...');
    const ticketsToInsert = seedData.supportTickets.map((st: any) => ({
      customId: st.id,
      userId: st.userId,
      userName: st.userName,
      userRole: st.userRole,
      category: st.category,
      priority: st.priority,
      subject: st.subject,
      description: st.description,
      status: st.status,
      bookingId: st.bookingId,
      venueId: st.venueId,
      venueName: st.venueName,
      messages: (st.messages || []).map((m: any) => ({
        id: m.id || `msg-${Date.now()}-${Math.random()}`,
        ticketId: m.ticketId || st.id,
        authorId: m.authorId || (m.authorRole === 'owner' ? st.userId : 'admin-1'),
        authorName: m.authorName || 'Support Agent',
        authorRole: m.authorRole || 'admin',
        message: m.message,
        createdAt: new Date(m.createdAt || Date.now()),
      })),
    }));
    const insertedTickets = await SupportTicket.insertMany(ticketsToInsert);
    console.log(`✅ Seeded ${insertedTickets.length} support tickets.`);

    // 7. Seed Initial Slots for the Next 7 Days for key venues
    console.log('Generating active slots for venues across the next 7 days...');
    const operatingHoursList = [
      { start: '06:00 AM', end: '07:00 AM' },
      { start: '07:00 AM', end: '08:00 AM' },
      { start: '08:00 AM', end: '09:00 AM' },
      { start: '09:00 AM', end: '10:00 AM' },
      { start: '10:00 AM', end: '11:00 AM' },
      { start: '04:00 PM', end: '05:00 PM' },
      { start: '05:00 PM', end: '06:00 PM' },
      { start: '06:00 PM', end: '07:00 PM' },
      { start: '07:00 PM', end: '08:00 PM' },
      { start: '08:00 PM', end: '09:00 PM' },
      { start: '09:00 PM', end: '10:00 PM' },
      { start: '10:00 PM', end: '11:00 PM' },
    ];

    const slotsToInsert = [];
    const today = new Date();
    // Generate dates for next 7 days
    const dateStrings: string[] = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(today);
      date.setDate(today.getDate() + d);
      dateStrings.push(date.toISOString().split('T')[0]!);
    }

    // Seed slots for first 10 venues
    for (const turf of turfsToInsert.slice(0, 10)) {
      for (const dateStr of dateStrings) {
        for (let idx = 0; idx < operatingHoursList.length; idx++) {
          const slotHour = operatingHoursList[idx]!;
          // Pseudo-random initial status
          const seed = (turf.customId.length + dateStr.length + idx * 7) % 10;
          let status: 'available' | 'booked' | 'maintenance' = 'available';
          if (seed === 1) status = 'booked';
          else if (seed === 9) status = 'maintenance';

          slotsToInsert.push({
            turfId: turf.customId,
            date: dateStr,
            startTime: slotHour.start,
            endTime: slotHour.end,
            status,
            bookingId: status === 'booked' ? `TB-INIT-${idx}` : undefined,
          });
        }
      }
    }

    const insertedSlots = await Slot.insertMany(slotsToInsert);
    console.log(`✅ Seeded ${insertedSlots.length} availability slots.`);

    // 8. Seed sample bookings
    console.log('Seeding initial bookings...');
    const demoBookings = [
      {
        bookingReference: 'TB-2026-881234',
        userId: 'user-1',
        userName: 'Ayush Sharma',
        userPhone: '+91 98765 43210',
        userEmail: 'ayush@example.com',
        turfId: 'champions-arena',
        turfName: 'Champions Arena',
        turfAddress: 'Rajpur Road, Near Clock Tower, Dehradun',
        turfImage: '/assets/turf-champions.webp',
        sport: 'football',
        date: dateStrings[1],
        startTime: '07:00 PM',
        endTime: '08:00 PM',
        amount: 750,
        membershipDiscount: 75,
        rewardDiscount: 50,
        finalAmount: 625,
        rewardPointsEarned: 65,
        paymentStatus: 'PAID',
        status: 'confirmed',
        paymentMethod: 'UPI',
        qrCode: 'https://playo.in/verify/TB-2026-881234',
      },
      {
        bookingReference: 'TB-2026-881235',
        userId: 'user-1',
        userName: 'Ayush Sharma',
        userPhone: '+91 98765 43210',
        userEmail: 'ayush@example.com',
        turfId: 'greenfield-box',
        turfName: 'Greenfield Box Cricket',
        turfAddress: 'Clement Town, Subhash Nagar, Dehradun',
        turfImage: '/assets/turf-greenfield.webp',
        sport: 'cricket',
        date: dateStrings[2],
        startTime: '06:00 PM',
        endTime: '07:00 PM',
        amount: 500,
        membershipDiscount: 0,
        rewardDiscount: 0,
        finalAmount: 500,
        rewardPointsEarned: 50,
        paymentStatus: 'PAID',
        status: 'confirmed',
        paymentMethod: 'Card',
        qrCode: 'https://playo.in/verify/TB-2026-881235',
      },
      {
        bookingReference: 'TB-2026-881236',
        userId: 'user-2',
        userName: 'Priya Patel',
        userPhone: '+91 87654 32109',
        userEmail: 'priya@example.com',
        turfId: 'delhi-kickoff-hauz-khas',
        turfName: 'Hauz Khas Football Arena',
        turfAddress: 'Hauz Khas Village Road, New Delhi',
        turfImage: '/assets/ai-football-turf.webp',
        sport: 'football',
        date: dateStrings[0],
        startTime: '08:00 PM',
        endTime: '09:00 PM',
        amount: 1200,
        membershipDiscount: 120,
        rewardDiscount: 0,
        finalAmount: 1080,
        rewardPointsEarned: 108,
        paymentStatus: 'PAID',
        status: 'confirmed',
        paymentMethod: 'UPI',
        qrCode: 'https://playo.in/verify/TB-2026-881236',
      },
    ];
    const insertedBookings = await Booking.insertMany(demoBookings);
    console.log(`✅ Seeded ${insertedBookings.length} initial bookings.`);

    // 9. Seed sample reviews
    console.log('Seeding customer reviews...');
    const demoReviews = [
      {
        turfId: 'champions-arena',
        userId: 'user-1',
        userName: 'Ayush Sharma',
        rating: 5,
        comment: 'Brilliant pitch with top-class floodlights! Changing rooms were very clean and booking through Playo was seamless.',
        sports: ['football'],
        verifiedBooking: true,
        helpfulCount: 14,
        createdAt: new Date('2026-09-20'),
      },
      {
        turfId: 'champions-arena',
        userId: 'user-2',
        userName: 'Priya Patel',
        rating: 4.8,
        comment: 'Great atmosphere and scenic background. Turf quality is exceptional. High recommendation for 7v7 games.',
        sports: ['football', 'cricket'],
        verifiedBooking: true,
        helpfulCount: 8,
        createdAt: new Date('2026-09-25'),
      },
      {
        turfId: 'doon-gaming-zone',
        userId: 'user-1',
        userName: 'Ayush Sharma',
        rating: 5,
        comment: 'The VR cricket simulator and bowling alley are incredible! Great weekend spot for groups.',
        sports: ['multi-sport'],
        verifiedBooking: true,
        helpfulCount: 12,
        createdAt: new Date('2026-10-02'),
      },
    ];
    const insertedReviews = await Review.insertMany(demoReviews);
    console.log(`✅ Seeded ${insertedReviews.length} reviews.`);

    console.log('\n========================================');
    console.log('🎉 DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('========================================\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
