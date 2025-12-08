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

const app = express();
const PORT = process.env.PORT || 4000;

// MongoDB 연결
connectDB();

// CORS 설정
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    process.env.ADMIN_URL || 'http://localhost:5001',
  ],
  credentials: true,
}));

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
});
