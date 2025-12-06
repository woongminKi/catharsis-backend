import { Router, Response } from 'express';
import Passer from '../models/Passer';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// 모든 라우트에 인증 미들웨어 적용
router.use(authMiddleware);

// 삭제된 게시글 목록 조회 (/:id 라우트보다 먼저 정의해야 함)
router.get('/deleted/list', async (req: AuthRequest, res: Response) => {
  try {
    const page = req.query.page || '1';
    const limit = req.query.limit || '10';

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const [passers, totalItems] = await Promise.all([
      Passer.find({ isDeleted: true })
        .sort({ deletedAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Passer.countDocuments({ isDeleted: true }),
    ]);

    const totalPages = Math.ceil(totalItems / limitNum);

    res.json({
      success: true,
      data: passers,
      pagination: {
        currentPage: pageNum,
        totalPages: totalPages,
        totalItems: totalItems,
        limit: limitNum,
      },
    });
  } catch (error) {
    console.error('Error fetching deleted passers:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// 게시글 목록 조회 (관리자용)
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

    const [passers, totalItems] = await Promise.all([
      Passer.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .setOptions({ strictQuery: false }),
      Passer.countDocuments(query).setOptions({ strictQuery: false }),
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

// 게시글 상세 조회 (관리자용)
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const passer = await Passer.findOne({
      _id: id,
      isDeleted: false,
    });

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

// 게시글 생성
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { title, thumbnailUrl, imageUrls } = req.body;

    if (!title || !thumbnailUrl) {
      return res.status(400).json({ success: false, message: '제목과 썸네일 이미지는 필수입니다.' });
    }

    const passer = new Passer({
      title,
      thumbnailUrl,
      imageUrls: imageUrls || [],
    });

    await passer.save();

    res.status(201).json({
      success: true,
      message: '게시글이 등록되었습니다.',
      data: passer,
    });
  } catch (error) {
    console.error('Error creating passer:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// 게시글 수정
router.patch('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, thumbnailUrl, imageUrls } = req.body;

    const updateData: Record<string, unknown> = {};
    if (title) updateData.title = title;
    if (thumbnailUrl) updateData.thumbnailUrl = thumbnailUrl;
    if (imageUrls !== undefined) updateData.imageUrls = imageUrls;

    const passer = await Passer.findOneAndUpdate(
      { _id: id, isDeleted: false },
      updateData,
      { new: true }
    );

    if (!passer) {
      return res.status(404).json({ success: false, message: '게시글을 찾을 수 없습니다.' });
    }

    res.json({ success: true, message: '게시글이 수정되었습니다.', data: passer });
  } catch (error) {
    console.error('Error updating passer:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// 게시글 삭제 (소프트 삭제)
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const passer = await Passer.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { isDeleted: true, deletedAt: new Date() },
      { new: true }
    );

    if (!passer) {
      return res.status(404).json({ success: false, message: '게시글을 찾을 수 없습니다.' });
    }

    res.json({ success: true, message: '게시글이 삭제되었습니다.' });
  } catch (error) {
    console.error('Error deleting passer:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// 게시글 복구
router.post('/:id/restore', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const passer = await Passer.findOneAndUpdate(
      { _id: id, isDeleted: true },
      { isDeleted: false, $unset: { deletedAt: 1 } },
      { new: true }
    );

    if (!passer) {
      return res.status(404).json({ success: false, message: '게시글을 찾을 수 없습니다.' });
    }

    res.json({ success: true, message: '게시글이 복구되었습니다.', data: passer });
  } catch (error) {
    console.error('Error restoring passer:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// 게시글 완전 삭제
router.delete('/:id/permanent', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const passer = await Passer.findOneAndDelete({ _id: id, isDeleted: true });

    if (!passer) {
      return res.status(404).json({ success: false, message: '게시글을 찾을 수 없습니다.' });
    }

    res.json({ success: true, message: '게시글이 완전히 삭제되었습니다.' });
  } catch (error) {
    console.error('Error permanently deleting passer:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// 일괄 삭제
router.post('/bulk-delete', async (req: AuthRequest, res: Response) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: '삭제할 게시글을 선택해주세요.' });
    }

    await Passer.updateMany(
      { _id: { $in: ids }, isDeleted: false },
      { isDeleted: true, deletedAt: new Date() }
    );

    res.json({ success: true, message: `${ids.length}개의 게시글이 삭제되었습니다.` });
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
      return res.status(400).json({ success: false, message: '복구할 게시글을 선택해주세요.' });
    }

    await Passer.updateMany(
      { _id: { $in: ids }, isDeleted: true },
      { isDeleted: false, $unset: { deletedAt: 1 } }
    );

    res.json({ success: true, message: `${ids.length}개의 게시글이 복구되었습니다.` });
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
      return res.status(400).json({ success: false, message: '삭제할 게시글을 선택해주세요.' });
    }

    await Passer.deleteMany({ _id: { $in: ids }, isDeleted: true });

    res.json({ success: true, message: `${ids.length}개의 게시글이 완전히 삭제되었습니다.` });
  } catch (error) {
    console.error('Error bulk permanent deleting:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

export default router;
