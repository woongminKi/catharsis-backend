import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
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

const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Length', 'X-Request-Id'],
};

// CORS 미들웨어 적용
app.use(cors(corsOptions));

// Preflight 요청 명시적 처리 (모든 라우트에 대해)
app.options('*', cors(corsOptions));

// Middleware - 파일 업로드를 위해 크기 제한 늘림
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

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

// 글로벌 에러 핸들러 - 에러 발생 시에도 CORS 헤더 포함
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin;

  // CORS 헤더 설정 (허용된 origin인 경우)
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  }

  console.error('Global error handler:', err.message);

  // CORS 에러인 경우
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ error: 'CORS policy: Origin not allowed' });
  }

  // 일반 에러
  res.status(500).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(
    'Routes loaded: resources, admin/resources, galleries, admin/galleries'
  );
});
