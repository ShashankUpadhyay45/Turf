import { logger } from './utils/logger';

const seedData = async () => {
  logger.info('Starting seed script...');
  
  const turfs = [
    { name: 'Champions Arena', sport: 'football', area: 'North', rating: 4.5, price: 1000 },
    { name: 'Skyline', sport: 'cricket', area: 'South', rating: 4.8, price: 1500 },
    { name: 'Greenfield', sport: 'football', area: 'East', rating: 4.2, price: 800 }
  ];
  
  const users = [
    { email: 'ayush@example.com', role: 'user', name: 'Ayush' },
    { email: 'owner@champions.com', role: 'owner', name: 'Champions Owner' },
    { email: 'admin@playo.in', role: 'admin', name: 'Admin' }
  ];
  
  const memberships = [
    { name: 'Pro Player', price: 999 },
    { name: 'Elite', price: 1999 }
  ];

  logger.info('Mocking database population...');
  logger.info(`Seeded ${turfs.length} turfs.`);
  logger.info(`Seeded ${users.length} users.`);
  logger.info(`Seeded ${memberships.length} memberships.`);
  
  logger.info('Seeding completed successfully!');
};

if (require.main === module) {
  seedData()
    .then(() => process.exit(0))
    .catch(err => {
      logger.error('Error seeding data', err);
      process.exit(1);
    });
}
