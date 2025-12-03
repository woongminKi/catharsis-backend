import { Router, Response } from 'express';
import Consultation from '../models/Consultation';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import mongoose from 'mongoose';

const router = Router();

// 모든 라우트에 인증 미들웨어 적용
router.use(authMiddleware);

// 삭제된 게시글 목록 조회 (/:id 라우트보다 먼저 정의해야 함)
router.get('/deleted/list', async (req: AuthRequest, res: Response) => {
  try {
    var page = req.query.page || '1';
    var limit = req.query.limit || '10';

    var pageNum = parseInt(page as string, 10);
    var limitNum = parseInt(limit as string, 10);
    var skip = (pageNum - 1) * limitNum;

    var results = await Promise.all([
      Consultation.find({ isDeleted: true })
        .select('-password')
        .sort({ deletedAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Consultation.countDocuments({ isDeleted: true }),
    ]);
    var consultations = results[0];
    var totalItems = results[1];

    var totalPages = Math.ceil(totalItems / limitNum);

    res.json({
      success: true,
      data: consultations,
      pagination: {
        currentPage: pageNum,
        totalPages: totalPages,
        totalItems: totalItems,
        limit: limitNum,
      },
    });
  } catch (error) {
    console.error('Error fetching deleted consultations:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// 게시글 목록 조회 (관리자용 - 비밀글 포함, 삭제되지 않은 글)
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const {
      page = '1',
      limit = '10',
      boardType,
      searchType,
      keyword,
      startDate,
      endDate,
    } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const query: Record<string, unknown> = { isDeleted: false };

    if (boardType && boardType !== 'all') {
      query.boardType = boardType;
    }

    if (keyword && searchType) {
      const searchKeyword = keyword as string;
      switch (searchType) {
        case 'title':
          query.title = { $regex: searchKeyword, $options: 'i' };
          break;
        case 'content':
          query.content = { $regex: searchKeyword, $options: 'i' };
          break;
        case 'writerId':
          query.writerId = { $regex: searchKeyword, $options: 'i' };
          break;
      }
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

    const [consultations, totalItems] = await Promise.all([
      Consultation.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .setOptions({ strictQuery: false }),
      Consultation.countDocuments(query).setOptions({ strictQuery: false }),
    ]);

    const totalPages = Math.ceil(totalItems / limitNum);

    res.json({
      success: true,
      data: consultations,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalItems,
        limit: limitNum,
      },
    });
  } catch (error) {
    console.error('Error fetching consultations:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// 게시글 상세 조회 (관리자용 - 비밀번호 없이 조회 가능)
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const consultation = await Consultation.findOne({
      _id: id,
      isDeleted: false,
    }).select('-password');

    if (!consultation) {
      return res.status(404).json({ success: false, message: '게시글을 찾을 수 없습니다.' });
    }

    res.json({
      success: true,
      data: consultation,
    });
  } catch (error) {
    console.error('Error fetching consultation:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// 게시글 수정 (관리자용)
router.patch('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, content, isSecret, status } = req.body;

    const updateData: Record<string, unknown> = {};
    if (title) updateData.title = title;
    if (content) updateData.content = content;
    if (typeof isSecret === 'boolean') updateData.isSecret = isSecret;
    if (status) updateData.status = status;

    const consultation = await Consultation.findOneAndUpdate(
      { _id: id, isDeleted: false },
      updateData,
      { new: true }
    ).select('-password');

    if (!consultation) {
      return res.status(404).json({ success: false, message: '게시글을 찾을 수 없습니다.' });
    }

    res.json({ success: true, message: '게시글이 수정되었습니다.', data: consultation });
  } catch (error) {
    console.error('Error updating consultation:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// 게시글 삭제 (소프트 삭제)
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const consultation = await Consultation.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { isDeleted: true, deletedAt: new Date() },
      { new: true }
    );

    if (!consultation) {
      return res.status(404).json({ success: false, message: '게시글을 찾을 수 없습니다.' });
    }

    res.json({ success: true, message: '게시글이 삭제되었습니다.' });
  } catch (error) {
    console.error('Error deleting consultation:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// 댓글(답변) 추가
router.post('/:id/comments', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ success: false, message: '답변 내용을 입력해주세요.' });
    }

    const consultation = await Consultation.findOneAndUpdate(
      { _id: id, isDeleted: false },
      {
        $push: {
          comments: {
            author: '관리자',
            content,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
        status: 'ANSWERED',
      },
      { new: true }
    ).select('-password');

    if (!consultation) {
      return res.status(404).json({ success: false, message: '게시글을 찾을 수 없습니다.' });
    }

    res.json({
      success: true,
      message: '답변이 등록되었습니다.',
      data: consultation,
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// 댓글(답변) 수정
router.patch('/:id/comments/:commentId', async (req: AuthRequest, res: Response) => {
  try {
    const { id, commentId } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ success: false, message: '답변 내용을 입력해주세요.' });
    }

    const consultation = await Consultation.findOneAndUpdate(
      {
        _id: id,
        isDeleted: false,
        'comments._id': new mongoose.Types.ObjectId(commentId),
      },
      {
        $set: {
          'comments.$.content': content,
          'comments.$.updatedAt': new Date(),
        },
      },
      { new: true }
    ).select('-password');

    if (!consultation) {
      return res.status(404).json({ success: false, message: '게시글 또는 댓글을 찾을 수 없습니다.' });
    }

    res.json({
      success: true,
      message: '답변이 수정되었습니다.',
      data: consultation,
    });
  } catch (error) {
    console.error('Error updating comment:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// 댓글(답변) 삭제
router.delete('/:id/comments/:commentId', async (req: AuthRequest, res: Response) => {
  try {
    const { id, commentId } = req.params;

    const consultation = await Consultation.findOneAndUpdate(
      { _id: id, isDeleted: false },
      {
        $pull: {
          comments: { _id: new mongoose.Types.ObjectId(commentId) },
        },
      },
      { new: true }
    ).select('-password');

    if (!consultation) {
      return res.status(404).json({ success: false, message: '게시글을 찾을 수 없습니다.' });
    }

    // 댓글이 없으면 상태를 PENDING으로 변경
    if (consultation.comments.length === 0) {
      consultation.status = 'PENDING';
      await consultation.save();
    }

    res.json({
      success: true,
      message: '답변이 삭제되었습니다.',
      data: consultation,
    });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// 게시글 복구
router.post('/:id/restore', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const consultation = await Consultation.findOneAndUpdate(
      { _id: id, isDeleted: true },
      { isDeleted: false, $unset: { deletedAt: 1 } },
      { new: true }
    ).select('-password');

    if (!consultation) {
      return res.status(404).json({ success: false, message: '게시글을 찾을 수 없습니다.' });
    }

    res.json({ success: true, message: '게시글이 복구되었습니다.', data: consultation });
  } catch (error) {
    console.error('Error restoring consultation:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// 게시글 완전 삭제
router.delete('/:id/permanent', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const consultation = await Consultation.findOneAndDelete({ _id: id, isDeleted: true });

    if (!consultation) {
      return res.status(404).json({ success: false, message: '게시글을 찾을 수 없습니다.' });
    }

    res.json({ success: true, message: '게시글이 완전히 삭제되었습니다.' });
  } catch (error) {
    console.error('Error permanently deleting consultation:', error);
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

    await Consultation.updateMany(
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

    await Consultation.updateMany(
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

    await Consultation.deleteMany({ _id: { $in: ids }, isDeleted: true });

    res.json({ success: true, message: `${ids.length}개의 게시글이 완전히 삭제되었습니다.` });
  } catch (error) {
    console.error('Error bulk permanent deleting:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

export default router;
