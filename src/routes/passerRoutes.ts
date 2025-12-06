import { Router, Request, Response } from 'express';
import Passer from '../models/Passer';

const router = Router();

// 게시글 목록 조회 (공개)
router.get('/', async (req: Request, res: Response) => {
  try {
    const {
      page = '1',
      limit = '10',
    } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const [passers, totalItems] = await Promise.all([
      Passer.find({ isDeleted: false })
        .select('title thumbnailUrl viewCount createdAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Passer.countDocuments({ isDeleted: false }),
    ]);

    const totalPages = Math.ceil(totalItems / limitNum);

    res.json({
      success: true,
      data: passers,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalItems,
        limit: limitNum,
      },
    });
  } catch (error) {
    console.error('Error fetching passers:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// 게시글 상세 조회 (공개)
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const passer = await Passer.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $inc: { viewCount: 1 } },
      { new: true }
    );

    if (!passer) {
      return res.status(404).json({ success: false, message: '게시글을 찾을 수 없습니다.' });
    }

    res.json({
      success: true,
      data: passer,
    });
  } catch (error) {
    console.error('Error fetching passer:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

export default router;
