import { Router, Request, Response } from 'express';
import Consultation from '../models/Consultation';

const router = Router();

// 게시글 목록 조회
router.get('/', async (req: Request, res: Response) => {
  try {
    const {
      page = '1',
      limit = '10',
      boardType = 'INQUIRY',
      searchType,
      keyword,
    } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    // 검색 조건
    const query: Record<string, unknown> = { boardType };

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

    const [consultations, totalItems] = await Promise.all([
      Consultation.find(query)
        .select('-password -content')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Consultation.countDocuments(query),
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

// 게시글 상세 조회
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const consultation = await Consultation.findById(id).select('-password');

    if (!consultation) {
      return res.status(404).json({ success: false, message: '게시글을 찾을 수 없습니다.' });
    }

    // 비밀글인 경우 비밀번호 확인 필요 표시
    if (consultation.isSecret) {
      return res.json({
        success: true,
        data: {
          _id: consultation._id,
          title: consultation.title,
          writerId: consultation.writerId,
          isSecret: consultation.isSecret,
          status: consultation.status,
          createdAt: consultation.createdAt,
          needPassword: true,
        },
      });
    }

    // 조회수 증가
    await Consultation.findByIdAndUpdate(id, { $inc: { viewCount: 1 } });

    res.json({
      success: true,
      data: {
        ...consultation.toObject(),
        viewCount: consultation.viewCount + 1,
      },
    });
  } catch (error) {
    console.error('Error fetching consultation:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// 비밀번호 확인 (비밀글 조회용)
router.post('/:id/check-password', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    const consultation = await Consultation.findById(id);

    if (!consultation) {
      return res.status(404).json({ success: false, message: '게시글을 찾을 수 없습니다.' });
    }

    if (consultation.password !== password) {
      return res.status(401).json({ success: false, message: '비밀번호가 일치하지 않습니다.' });
    }

    // 조회수 증가
    await Consultation.findByIdAndUpdate(id, { $inc: { viewCount: 1 } });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...result } = consultation.toObject();

    res.json({
      success: true,
      data: {
        ...result,
        viewCount: consultation.viewCount + 1,
      },
    });
  } catch (error) {
    console.error('Error checking password:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// 게시글 작성
router.post('/', async (req: Request, res: Response) => {
  try {
    const { writerId, password, title, content, boardType, isSecret } = req.body;

    // 유효성 검사
    if (!writerId || !title || !content) {
      return res.status(400).json({ success: false, message: '필수 항목을 모두 입력해주세요.' });
    }

    // 비밀글인 경우 비밀번호 필수
    if (isSecret) {
      if (!password) {
        return res.status(400).json({ success: false, message: '비밀글은 비밀번호를 입력해야 합니다.' });
      }
      if (password.length < 4) {
        return res.status(400).json({ success: false, message: '비밀번호는 4자 이상이어야 합니다.' });
      }
    }

    const consultation = new Consultation({
      writerId,
      password,
      title,
      content,
      boardType: boardType || 'INQUIRY',
      isSecret: isSecret || false,
    });

    await consultation.save();

    res.status(201).json({
      success: true,
      message: '게시글이 등록되었습니다.',
      data: { _id: consultation._id },
    });
  } catch (error) {
    console.error('Error creating consultation:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// 게시글 수정
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { password, title, content, isSecret } = req.body;

    const consultation = await Consultation.findById(id);

    if (!consultation) {
      return res.status(404).json({ success: false, message: '게시글을 찾을 수 없습니다.' });
    }

    if (consultation.password !== password) {
      return res.status(401).json({ success: false, message: '비밀번호가 일치하지 않습니다.' });
    }

    const updateData: Record<string, unknown> = {};
    if (title) updateData.title = title;
    if (content) updateData.content = content;
    if (typeof isSecret === 'boolean') updateData.isSecret = isSecret;

    await Consultation.findByIdAndUpdate(id, updateData);

    res.json({ success: true, message: '게시글이 수정되었습니다.' });
  } catch (error) {
    console.error('Error updating consultation:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// 게시글 삭제 (소프트 삭제)
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    const consultation = await Consultation.findById(id);

    if (!consultation) {
      return res.status(404).json({ success: false, message: '게시글을 찾을 수 없습니다.' });
    }

    if (consultation.password !== password) {
      return res.status(401).json({ success: false, message: '비밀번호가 일치하지 않습니다.' });
    }

    await Consultation.findByIdAndUpdate(id, {
      isDeleted: true,
      deletedAt: new Date(),
    });

    res.json({ success: true, message: '게시글이 삭제되었습니다.' });
  } catch (error) {
    console.error('Error deleting consultation:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// 관리자용: 댓글 추가
router.post('/:id/comments', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { content, author = '관리자' } = req.body;

    if (!content) {
      return res.status(400).json({ success: false, message: '댓글 내용을 입력해주세요.' });
    }

    const consultation = await Consultation.findByIdAndUpdate(
      id,
      {
        $push: {
          comments: { author, content },
        },
        status: 'ANSWERED',
      },
      { new: true }
    );

    if (!consultation) {
      return res.status(404).json({ success: false, message: '게시글을 찾을 수 없습니다.' });
    }

    res.json({
      success: true,
      message: '답변이 등록되었습니다.',
      data: consultation.comments,
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

export default router;
