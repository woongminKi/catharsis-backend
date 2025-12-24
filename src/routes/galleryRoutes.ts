import { Router, Request, Response } from 'express';
import Gallery from '../models/Gallery';

const router = Router();

// 갤러리 목록 조회 (공개)
router.get('/', async (req: Request, res: Response) => {
  try {
    const {
      page = '1',
      limit = '12',
    } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const [galleries, totalItems] = await Promise.all([
      Gallery.find({ isDeleted: false })
        .select('title imageUrl viewCount createdAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Gallery.countDocuments({ isDeleted: false }),
    ]);

    const totalPages = Math.ceil(totalItems / limitNum);

    res.json({
      success: true,
      data: galleries,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalItems,
        limit: limitNum,
      },
    });
  } catch (error) {
    console.error('Error fetching galleries:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// 갤러리 상세 조회 (공개)
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const gallery = await Gallery.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $inc: { viewCount: 1 } },
      { new: true }
    );

    if (!gallery) {
      return res.status(404).json({ success: false, message: '갤러리를 찾을 수 없습니다.' });
    }

    res.json({
      success: true,
      data: gallery,
    });
  } catch (error) {
    console.error('Error fetching gallery:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

export default router;
