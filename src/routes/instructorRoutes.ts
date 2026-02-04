import { Router, Request, Response } from 'express';
import Instructor from '../models/Instructor';

const router = Router();

// 강사 목록 조회 (공개)
router.get('/', async (req: Request, res: Response) => {
  try {
    const { category } = req.query;

    const query: Record<string, unknown> = { isDeleted: false, isActive: true };

    if (category && ['leader', 'acting', 'musical', 'dance'].includes(category as string)) {
      query.category = category;
    }

    const instructors = await Instructor.find(query)
      .select('name position education category profileImages order')
      .sort({ category: 1, order: 1 })
      .setOptions({ strictQuery: false });

    res.json({
      success: true,
      data: instructors,
    });
  } catch (error) {
    console.error('Error fetching instructors:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// 강사 상세 조회 (공개)
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const instructor = await Instructor.findOneAndUpdate(
      { _id: id, isDeleted: false, isActive: true },
      { $inc: { viewCount: 1 } },
      { new: true }
    );

    if (!instructor) {
      return res.status(404).json({ success: false, message: '강사를 찾을 수 없습니다.' });
    }

    res.json({
      success: true,
      data: instructor,
    });
  } catch (error) {
    console.error('Error fetching instructor:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

export default router;
