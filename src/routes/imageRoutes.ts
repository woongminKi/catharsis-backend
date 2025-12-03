import { Router, Request, Response } from 'express';
import multer from 'multer';
import { uploadImage, listImages, deleteImage } from '../services/imageService';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
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

// 이미지 업로드
router.post('/upload', upload.single('image'), async (req: Request, res: Response) => {
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
router.post('/upload-multiple', upload.array('images', 10), async (req: Request, res: Response) => {
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
