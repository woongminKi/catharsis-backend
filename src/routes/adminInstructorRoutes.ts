import { Router, Response } from 'express';
import Instructor from '../models/Instructor';
import { authMiddleware, AuthRequest } from '../middleware/auth';

console.log('adminInstructorRoutes loaded');

const router = Router();

// 모든 라우트에 인증 미들웨어 적용
router.use(authMiddleware);

// 삭제된 강사 목록 조회
router.get('/deleted/list', async (req: AuthRequest, res: Response) => {
  try {
    const page = req.query.page || '1';
    const limit = req.query.limit || '10';

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const [instructors, totalItems] = await Promise.all([
      Instructor.find({ isDeleted: true })
        .sort({ deletedAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Instructor.countDocuments({ isDeleted: true }),
    ]);

    const totalPages = Math.ceil(totalItems / limitNum);

    res.json({
      success: true,
      data: instructors,
      pagination: {
        currentPage: pageNum,
        totalPages: totalPages,
        totalItems: totalItems,
        limit: limitNum,
      },
    });
  } catch (error) {
    console.error('Error fetching deleted instructors:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// 강사 목록 조회 (관리자용)
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const {
      page = '1',
      limit = '10',
      keyword,
      category,
    } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const query: Record<string, unknown> = { isDeleted: false };

    if (keyword) {
      query.name = { $regex: keyword as string, $options: 'i' };
    }

    if (category && ['leader', 'acting', 'musical', 'dance'].includes(category as string)) {
      query.category = category;
    }

    const [instructors, totalItems] = await Promise.all([
      Instructor.find(query)
        .sort({ category: 1, order: 1 })
        .skip(skip)
        .limit(limitNum)
        .setOptions({ strictQuery: false }),
      Instructor.countDocuments(query).setOptions({ strictQuery: false }),
    ]);

    const totalPages = Math.ceil(totalItems / limitNum);

    res.json({
      success: true,
      data: instructors,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalItems,
        limit: limitNum,
      },
    });
  } catch (error) {
    console.error('Error fetching instructors:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// 강사 상세 조회 (관리자용)
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const instructor = await Instructor.findOne({
      _id: id,
      isDeleted: false,
    });

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

// 강사 생성
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { name, position, education, category, profileImages, detailSections, isActive } = req.body;

    if (!name || !position || !education || !category) {
      return res.status(400).json({ success: false, message: '필수 정보를 입력해주세요.' });
    }

    // 해당 카테고리의 max(order) + 1 자동 할당
    const maxOrderInstructor = await Instructor.findOne({ category, isDeleted: false })
      .sort({ order: -1 })
      .select('order');
    const newOrder = (maxOrderInstructor?.order || 0) + 1;

    const instructor = new Instructor({
      name,
      position,
      education,
      category,
      profileImages: profileImages || [],
      detailSections: detailSections || [],
      order: newOrder,
      isActive: isActive !== undefined ? isActive : true,
    });

    await instructor.save();

    res.status(201).json({
      success: true,
      message: '강사가 등록되었습니다.',
      data: instructor,
    });
  } catch (error) {
    console.error('Error creating instructor:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// 강사 수정
router.patch('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, position, education, category, profileImages, detailSections, order, isActive } = req.body;

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (position !== undefined) updateData.position = position;
    if (education !== undefined) updateData.education = education;
    if (category !== undefined) updateData.category = category;
    if (profileImages !== undefined) updateData.profileImages = profileImages;
    if (detailSections !== undefined) updateData.detailSections = detailSections;
    if (order !== undefined) updateData.order = order;
    if (isActive !== undefined) updateData.isActive = isActive;

    const instructor = await Instructor.findOneAndUpdate(
      { _id: id, isDeleted: false },
      updateData,
      { new: true }
    );

    if (!instructor) {
      return res.status(404).json({ success: false, message: '강사를 찾을 수 없습니다.' });
    }

    res.json({ success: true, message: '강사 정보가 수정되었습니다.', data: instructor });
  } catch (error) {
    console.error('Error updating instructor:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// 강사 삭제 (소프트 삭제)
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const instructor = await Instructor.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { isDeleted: true, deletedAt: new Date() },
      { new: true }
    );

    if (!instructor) {
      return res.status(404).json({ success: false, message: '강사를 찾을 수 없습니다.' });
    }

    res.json({ success: true, message: '강사가 삭제되었습니다.' });
  } catch (error) {
    console.error('Error deleting instructor:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// 강사 복구
router.post('/:id/restore', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const instructor = await Instructor.findOneAndUpdate(
      { _id: id, isDeleted: true },
      { isDeleted: false, $unset: { deletedAt: 1 } },
      { new: true }
    );

    if (!instructor) {
      return res.status(404).json({ success: false, message: '강사를 찾을 수 없습니다.' });
    }

    res.json({ success: true, message: '강사가 복구되었습니다.', data: instructor });
  } catch (error) {
    console.error('Error restoring instructor:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// 강사 완전 삭제
router.delete('/:id/permanent', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const instructor = await Instructor.findOneAndDelete({ _id: id, isDeleted: true });

    if (!instructor) {
      return res.status(404).json({ success: false, message: '강사를 찾을 수 없습니다.' });
    }

    res.json({ success: true, message: '강사가 완전히 삭제되었습니다.' });
  } catch (error) {
    console.error('Error permanently deleting instructor:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// 일괄 삭제
router.post('/bulk-delete', async (req: AuthRequest, res: Response) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: '삭제할 강사를 선택해주세요.' });
    }

    await Instructor.updateMany(
      { _id: { $in: ids }, isDeleted: false },
      { isDeleted: true, deletedAt: new Date() }
    );

    res.json({ success: true, message: `${ids.length}명의 강사가 삭제되었습니다.` });
  } catch (error) {
    console.error('Error bulk deleting:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// 순서 일괄 변경
router.put('/reorder', async (req: AuthRequest, res: Response) => {
  try {
    const { orders } = req.body;

    if (!orders || !Array.isArray(orders)) {
      return res.status(400).json({ success: false, message: '순서 정보를 입력해주세요.' });
    }

    const updatePromises = orders.map((item: { id: string; order: number }) =>
      Instructor.findByIdAndUpdate(item.id, { order: item.order })
    );

    await Promise.all(updatePromises);

    res.json({ success: true, message: '순서가 변경되었습니다.' });
  } catch (error) {
    console.error('Error reordering instructors:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// 순서 위로 이동
router.put('/:id/move-up', async (req: AuthRequest, res: Response) => {
  console.log('Move up route hit, id:', req.params.id);
  try {
    const { id } = req.params;

    // 현재 강사의 category, order 조회
    const currentInstructor = await Instructor.findOne({ _id: id, isDeleted: false });
    if (!currentInstructor) {
      return res.status(404).json({ success: false, message: '강사를 찾을 수 없습니다.' });
    }

    // 같은 category에서 order < 현재order 중 가장 큰 order를 가진 강사 찾기
    const upperInstructor = await Instructor.findOne({
      category: currentInstructor.category,
      isDeleted: false,
      order: { $lt: currentInstructor.order },
    }).sort({ order: -1 });

    if (!upperInstructor) {
      return res.status(400).json({ success: false, message: '이미 가장 위에 있습니다.' });
    }

    // 두 강사의 order 값 교환
    const tempOrder = currentInstructor.order;
    currentInstructor.order = upperInstructor.order;
    upperInstructor.order = tempOrder;

    await Promise.all([currentInstructor.save(), upperInstructor.save()]);

    res.json({ success: true, message: '순서가 변경되었습니다.' });
  } catch (error) {
    console.error('Error moving instructor up:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// 순서 아래로 이동
router.put('/:id/move-down', async (req: AuthRequest, res: Response) => {
  console.log('Move down route hit, id:', req.params.id);
  try {
    const { id } = req.params;

    // 현재 강사의 category, order 조회
    const currentInstructor = await Instructor.findOne({ _id: id, isDeleted: false });
    if (!currentInstructor) {
      return res.status(404).json({ success: false, message: '강사를 찾을 수 없습니다.' });
    }

    // 같은 category에서 order > 현재order 중 가장 작은 order를 가진 강사 찾기
    const lowerInstructor = await Instructor.findOne({
      category: currentInstructor.category,
      isDeleted: false,
      order: { $gt: currentInstructor.order },
    }).sort({ order: 1 });

    if (!lowerInstructor) {
      return res.status(400).json({ success: false, message: '이미 가장 아래에 있습니다.' });
    }

    // 두 강사의 order 값 교환
    const tempOrder = currentInstructor.order;
    currentInstructor.order = lowerInstructor.order;
    lowerInstructor.order = tempOrder;

    await Promise.all([currentInstructor.save(), lowerInstructor.save()]);

    res.json({ success: true, message: '순서가 변경되었습니다.' });
  } catch (error) {
    console.error('Error moving instructor down:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

export default router;
