import { Router, Response } from 'express';
import Notice from '../models/Notice';
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

    const [notices, totalItems] = await Promise.all([
      Notice.find({ isDeleted: true })
        .sort({ deletedAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Notice.countDocuments({ isDeleted: true }),
    ]);

    const totalPages = Math.ceil(totalItems / limitNum);

    res.json({
      success: true,
      data: notices,
      pagination: {
        currentPage: pageNum,
        totalPages: totalPages,
        totalItems: totalItems,
        limit: limitNum,
      },
    });
  } catch (error) {
    console.error('Error fetching deleted notices:', error);
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

    const [notices, totalItems] = await Promise.all([
      Notice.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .setOptions({ strictQuery: false }),
      Notice.countDocuments(query).setOptions({ strictQuery: false }),
    ]);

    const totalPages = Math.ceil(totalItems / limitNum);

    res.json({
      success: true,
      data: notices,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalItems,
        limit: limitNum,
      },
    });
  } catch (error) {
    console.error('Error fetching notices:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// 게시글 상세 조회 (관리자용)
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const notice = await Notice.findOne({
      _id: id,
      isDeleted: false,
    });

    if (!notice) {
      return res.status(404).json({ success: false, message: '게시글을 찾을 수 없습니다.' });
    }

    res.json({
      success: true,
      data: notice,
    });
  } catch (error) {
    console.error('Error fetching notice:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// 게시글 생성
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { title, content, thumbnailUrl } = req.body;

    if (!title || !content) {
      return res.status(400).json({ success: false, message: '제목과 내용은 필수입니다.' });
    }

    const notice = new Notice({
      title,
      content,
      thumbnailUrl: thumbnailUrl || '',
    });

    await notice.save();

    res.status(201).json({
      success: true,
      message: '게시글이 등록되었습니다.',
      data: notice,
    });
  } catch (error) {
    console.error('Error creating notice:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// 게시글 수정
router.patch('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, content, thumbnailUrl } = req.body;

    const updateData: Record<string, unknown> = {};
    if (title) updateData.title = title;
    if (content) updateData.content = content;
    if (thumbnailUrl !== undefined) updateData.thumbnailUrl = thumbnailUrl;

    const notice = await Notice.findOneAndUpdate(
      { _id: id, isDeleted: false },
      updateData,
      { new: true }
    );

    if (!notice) {
      return res.status(404).json({ success: false, message: '게시글을 찾을 수 없습니다.' });
    }

    res.json({ success: true, message: '게시글이 수정되었습니다.', data: notice });
  } catch (error) {
    console.error('Error updating notice:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// 게시글 삭제 (소프트 삭제)
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const notice = await Notice.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { isDeleted: true, deletedAt: new Date() },
      { new: true }
    );

    if (!notice) {
      return res.status(404).json({ success: false, message: '게시글을 찾을 수 없습니다.' });
    }

    res.json({ success: true, message: '게시글이 삭제되었습니다.' });
  } catch (error) {
    console.error('Error deleting notice:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// 게시글 복구
router.post('/:id/restore', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const notice = await Notice.findOneAndUpdate(
      { _id: id, isDeleted: true },
      { isDeleted: false, $unset: { deletedAt: 1 } },
      { new: true }
    );

    if (!notice) {
      return res.status(404).json({ success: false, message: '게시글을 찾을 수 없습니다.' });
    }

    res.json({ success: true, message: '게시글이 복구되었습니다.', data: notice });
  } catch (error) {
    console.error('Error restoring notice:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// 게시글 완전 삭제
router.delete('/:id/permanent', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const notice = await Notice.findOneAndDelete({ _id: id, isDeleted: true });

    if (!notice) {
      return res.status(404).json({ success: false, message: '게시글을 찾을 수 없습니다.' });
    }

    res.json({ success: true, message: '게시글이 완전히 삭제되었습니다.' });
  } catch (error) {
    console.error('Error permanently deleting notice:', error);
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

    await Notice.updateMany(
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

    await Notice.updateMany(
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

    await Notice.deleteMany({ _id: { $in: ids }, isDeleted: true });

    res.json({ success: true, message: `${ids.length}개의 게시글이 완전히 삭제되었습니다.` });
  } catch (error) {
    console.error('Error bulk permanent deleting:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

export default router;
