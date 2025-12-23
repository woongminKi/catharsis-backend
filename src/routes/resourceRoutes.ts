import { Router, Request, Response } from 'express';
import Resource from '../models/Resource';

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

    const [resources, totalItems] = await Promise.all([
      Resource.find({ isDeleted: false })
        .select('title thumbnailUrl viewCount createdAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Resource.countDocuments({ isDeleted: false }),
    ]);

    const totalPages = Math.ceil(totalItems / limitNum);

    res.json({
      success: true,
      data: resources,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalItems,
        limit: limitNum,
      },
    });
  } catch (error) {
    console.error('Error fetching resources:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// 게시글 상세 조회 (공개)
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const resource = await Resource.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $inc: { viewCount: 1 } },
      { new: true }
    );

    if (!resource) {
      return res.status(404).json({ success: false, message: '게시글을 찾을 수 없습니다.' });
    }

    res.json({
      success: true,
      data: resource,
    });
  } catch (error) {
    console.error('Error fetching resource:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

export default router;
