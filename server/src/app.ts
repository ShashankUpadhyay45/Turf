import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';

const app = express();

app.use(helmet());
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173', 'http://127.0.0.1:3000'],
  credentials: true,
}));
app.use(express.json());
app.use(morgan('dev'));

const apiInfo = {
  status: 'online',
  service: 'Playo Turf Booking Backend API',
  version: '1.0.0',
  documentation: {
    health: '/health',
    turfs: '/api/v1/turfs',
    turfById: '/api/v1/turfs/:id (e.g. /api/v1/turfs/champions-arena)',
    slots: '/api/v1/slots?turfId=champions-arena&date=YYYY-MM-DD',
    holdSlot: 'POST /api/v1/slots/hold',
    bookings: 'GET /api/v1/bookings/my, POST /api/v1/bookings',
    tournaments: '/api/v1/tournaments',
    reviews: '/api/v1/reviews/turf/:turfId',
    auth: 'POST /api/v1/auth/login, POST /api/v1/auth/register',
  },
  timestamp: new Date().toISOString(),
};

// Root & Health check endpoints
app.get(['/', '/health'], (req, res) => {
  res.status(200).json(apiInfo);
});

app.get(['/api', '/api/v1'], (req, res) => {
  res.status(200).json(apiInfo);
});

// Mount routes at both /api/v1 (standard) and /api (fallback)
app.use('/api/v1', routes);
app.use('/api', routes);

app.use(errorHandler);

export default app;
