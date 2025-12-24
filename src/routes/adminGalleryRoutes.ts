import { Router, Response } from 'express';
import Gallery from '../models/Gallery';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// 모든 라우트에 인증 미들웨어 적용
router.use(authMiddleware);

// 삭제된 갤러리 목록 조회 (/:id 라우트보다 먼저 정의해야 함)
router.get('/deleted/list', async (req: AuthRequest, res: Response) => {
  try {
    const page = req.query.page || '1';
    const limit = req.query.limit || '10';

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const [galleries, totalItems] = await Promise.all([
      Gallery.find({ isDeleted: true })
        .sort({ deletedAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Gallery.countDocuments({ isDeleted: true }),
    ]);

    const totalPages = Math.ceil(totalItems / limitNum);

    res.json({
      success: true,
      data: galleries,
      pagination: {
        currentPage: pageNum,
        totalPages: totalPages,
        totalItems: totalItems,
        limit: limitNum,
      },
    });
  } catch (error) {
    console.error('Error fetching deleted galleries:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// 갤러리 목록 조회 (관리자용)
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const {
      page = '1',
      limit = '10',
      keyword,
      startDate,
      endDate,
    } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const query: Record<string, unknown> = { isDeleted: false };

    if (keyword) {
      query.title = { $regex: keyword as string, $options: 'i' };
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        (query.createdAt as Record<string, unknown>).$gte = new Date(startDate as string);
      }
      if (endDate) {
        const end = new Date(endDate as string);
        end.setHours(23, 59, 59, 999);
        (query.createdAt as Record<string, unknown>).$lte = end;
      }
    }

    const [galleries, totalItems] = await Promise.all([
      Gallery.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .setOptions({ strictQuery: false }),
      Gallery.countDocuments(query).setOptions({ strictQuery: false }),
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

// 갤러리 상세 조회 (관리자용)
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const gallery = await Gallery.findOne({
      _id: id,
      isDeleted: false,
    });

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

// 갤러리 생성
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { title, imageUrl } = req.body;

    if (!title || !imageUrl) {
      return res.status(400).json({ success: false, message: '제목과 이미지는 필수입니다.' });
    }

    const gallery = new Gallery({
      title,
      imageUrl,
    });

    await gallery.save();

    res.status(201).json({
      success: true,
      message: '갤러리가 등록되었습니다.',
      data: gallery,
    });
  } catch (error) {
    console.error('Error creating gallery:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// 갤러리 수정
router.patch('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, imageUrl } = req.body;

    const updateData: Record<string, unknown> = {};
    if (title) updateData.title = title;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;

    const gallery = await Gallery.findOneAndUpdate(
      { _id: id, isDeleted: false },
      updateData,
      { new: true }
    );

    if (!gallery) {
      return res.status(404).json({ success: false, message: '갤러리를 찾을 수 없습니다.' });
    }

    res.json({ success: true, message: '갤러리가 수정되었습니다.', data: gallery });
  } catch (error) {
    console.error('Error updating gallery:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// 갤러리 삭제 (소프트 삭제)
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const gallery = await Gallery.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { isDeleted: true, deletedAt: new Date() },
      { new: true }
    );

    if (!gallery) {
      return res.status(404).json({ success: false, message: '갤러리를 찾을 수 없습니다.' });
    }

    res.json({ success: true, message: '갤러리가 삭제되었습니다.' });
  } catch (error) {
    console.error('Error deleting gallery:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// 갤러리 복구
router.post('/:id/restore', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const gallery = await Gallery.findOneAndUpdate(
      { _id: id, isDeleted: true },
      { isDeleted: false, $unset: { deletedAt: 1 } },
      { new: true }
    );

    if (!gallery) {
      return res.status(404).json({ success: false, message: '갤러리를 찾을 수 없습니다.' });
    }

    res.json({ success: true, message: '갤러리가 복구되었습니다.', data: gallery });
  } catch (error) {
    console.error('Error restoring gallery:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// 갤러리 완전 삭제
router.delete('/:id/permanent', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const gallery = await Gallery.findOneAndDelete({ _id: id, isDeleted: true });

    if (!gallery) {
      return res.status(404).json({ success: false, message: '갤러리를 찾을 수 없습니다.' });
    }

    res.json({ success: true, message: '갤러리가 완전히 삭제되었습니다.' });
  } catch (error) {
    console.error('Error permanently deleting gallery:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// 일괄 삭제
router.post('/bulk-delete', async (req: AuthRequest, res: Response) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: '삭제할 갤러리를 선택해주세요.' });
    }

    await Gallery.updateMany(
      { _id: { $in: ids }, isDeleted: false },
      { isDeleted: true, deletedAt: new Date() }
    );

    res.json({ success: true, message: `${ids.length}개의 갤러리가 삭제되었습니다.` });
  } catch (error) {
    console.error('Error bulk deleting:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// 일괄 복구
router.post('/bulk-restore', async (req: AuthRequest, res: Response) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: '복구할 갤러리를 선택해주세요.' });
    }

    await Gallery.updateMany(
      { _id: { $in: ids }, isDeleted: true },
      { isDeleted: false, $unset: { deletedAt: 1 } }
    );

    res.json({ success: true, message: `${ids.length}개의 갤러리가 복구되었습니다.` });
  } catch (error) {
    console.error('Error bulk restoring:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// 일괄 완전 삭제
router.post('/bulk-permanent-delete', async (req: AuthRequest, res: Response) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: '삭제할 갤러리를 선택해주세요.' });
    }

    await Gallery.deleteMany({ _id: { $in: ids }, isDeleted: true });

    res.json({ success: true, message: `${ids.length}개의 갤러리가 완전히 삭제되었습니다.` });
  } catch (error) {
    console.error('Error bulk permanent deleting:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

export default router;
