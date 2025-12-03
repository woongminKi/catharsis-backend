import 'dotenv/config';
import express, { Request, Response } from 'express';
import cors from 'cors';
import imageRoutes from './routes/imageRoutes';

const app = express();
const PORT = process.env.PORT || 4000;

// CORS 설정
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/images', imageRoutes);

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
