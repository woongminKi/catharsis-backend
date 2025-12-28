import { Router, Request, Response } from 'express';
import multer from 'multer';
import { uploadImage, listImages, deleteImage } from '../services/imageService';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WEBP are allowed.'));
    }
  },
});

// CORS 허용 origin 목록 (index.ts와 동일하게 유지)
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

// CORS 헤더 설정 헬퍼 함수
const setCorsHeaders = (req: Request, res: Response) => {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  }
};

// Multer 에러 핸들링 미들웨어 - CORS 헤더 포함
const handleMulterError = (err: any, req: Request, res: Response, next: Function) => {
  // 에러 발생 시에도 CORS 헤더 설정
  setCorsHeaders(req, res);

  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ error: '파일 크기가 너무 큽니다. 최대 50MB까지 업로드 가능합니다.' });
    }
    return res.status(400).json({ error: err.message });
  } else if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
};

// 이미지 업로드
router.post('/upload', upload.single('image'), handleMulterError, async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    const folder = (req.body.folder as string) || 'images';
    const result = await uploadImage(req.file, folder);

    res.status(201).json({
      message: 'Image uploaded successfully',
      data: result,
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// 여러 이미지 업로드
router.post('/upload-multiple', upload.array('images', 10), handleMulterError, async (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      res.status(400).json({ error: 'No files uploaded' });
      return;
    }

    const folder = (req.body.folder as string) || 'images';
    const results = await Promise.all(
      files.map((file) => uploadImage(file, folder))
    );

    res.status(201).json({
      message: 'Images uploaded successfully',
      data: results,
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload images' });
  }
});

// 이미지 목록 조회
router.get('/list', async (req: Request, res: Response) => {
  try {
    const folder = (req.query.folder as string) || 'images';
    const maxKeys = parseInt(req.query.maxKeys as string) || 100;

    const images = await listImages(folder, maxKeys);

    res.json({
      message: 'Images retrieved successfully',
      data: images,
      count: images.length,
    });
  } catch (error) {
    console.error('List error:', error);
    res.status(500).json({ error: 'Failed to retrieve images' });
  }
});

// 이미지 삭제 (key는 query parameter로 전달)
router.delete('/', async (req: Request, res: Response) => {
  try {
    const key = req.query.key as string;

    if (!key) {
      res.status(400).json({ error: 'Image key is required' });
      return;
    }

    await deleteImage(key);

    res.json({
      message: 'Image deleted successfully',
    });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Failed to delete image' });
  }
});

export default router;
