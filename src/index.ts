import 'dotenv/config';
import express, { Request, Response } from 'express';
import cors from 'cors';
import connectDB from './config/database';
import imageRoutes from './routes/imageRoutes';
import consultationRoutes from './routes/consultationRoutes';
import authRoutes from './routes/authRoutes';
import adminConsultationRoutes from './routes/adminConsultationRoutes';
import passerRoutes from './routes/passerRoutes';
import adminPasserRoutes from './routes/adminPasserRoutes';
import noticeRoutes from './routes/noticeRoutes';
import adminNoticeRoutes from './routes/adminNoticeRoutes';
import resourceRoutes from './routes/resourceRoutes';
import adminResourceRoutes from './routes/adminResourceRoutes';
import contentRoutes from './routes/contentRoutes';
import adminContentRoutes from './routes/adminContentRoutes';
import galleryRoutes from './routes/galleryRoutes';
import adminGalleryRoutes from './routes/adminGalleryRoutes';

const app = express();
const PORT = process.env.PORT || 4000;

// MongoDB 연결
connectDB();

// CORS 설정
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  process.env.ADMIN_URL || 'http://localhost:5001',
  'http://www.catharsisact.com',
  'http://catharsisact.com',
  'http://catharsisact-admin.com',
  'http://www.catharsisact-admin.com',
  'https://www.catharsisact.com',
  'https://catharsisact.com',
  'https://catharsisact-admin.com',
  'https://www.catharsisact-admin.com',
  'http://localhost:3000',
  'http://localhost:5001',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/images', imageRoutes);
app.use('/api/consultations', consultationRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin/consultations', adminConsultationRoutes);
app.use('/api/passers', passerRoutes);
app.use('/api/admin/passers', adminPasserRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/admin/notices', adminNoticeRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/admin/resources', adminResourceRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/admin/content', adminContentRoutes);
app.use('/api/galleries', galleryRoutes);
app.use('/api/admin/galleries', adminGalleryRoutes);

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Root route
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Welcome to Catharsis API' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log('Routes loaded: resources, admin/resources, galleries, admin/galleries');
});
