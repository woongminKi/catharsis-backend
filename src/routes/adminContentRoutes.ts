import { Router, Response } from 'express';
import Content from '../models/Content';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// 모든 라우트에 인증 미들웨어 적용
router.use(authMiddleware);

// 콘텐츠 조회
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    let content = await Content.findOne();

    if (!content) {
      content = new Content({});
      await content.save();
    }

    // 데이터 정규화 - 모든 필드가 올바른 기본값을 갖도록 보장
    const contentObj = content.toObject() as any;

    // imageUrl (단수) 또는 imageUrls (복수) 둘 다 처리
    // 기존 DB에 imageUrl로 저장된 경우를 위한 마이그레이션 처리
    let heroImageUrls: string[] = [];
    if (contentObj.heroSection?.imageUrls && Array.isArray(contentObj.heroSection.imageUrls)) {
      heroImageUrls = contentObj.heroSection.imageUrls;
    } else if (contentObj.heroSection?.imageUrl && typeof contentObj.heroSection.imageUrl === 'string' && contentObj.heroSection.imageUrl.trim() !== '') {
      // 단수 imageUrl이 있으면 배열로 변환
      heroImageUrls = [contentObj.heroSection.imageUrl];
    }

    const normalizedData = {
      ...contentObj,
      heroSection: {
        imageUrls: heroImageUrls,
        subtitle: contentObj.heroSection?.subtitle || '',
        title: contentObj.heroSection?.title || '',
        buttonText: contentObj.heroSection?.buttonText || '',
        buttonLink: contentObj.heroSection?.buttonLink || '',
      },
      schoolPassers: contentObj.schoolPassers || [],
      youtubeVideos: contentObj.youtubeVideos || [],
      instructors: contentObj.instructors || [],
      instagramPosts: contentObj.instagramPosts || [],
      historyPassers: contentObj.historyPassers || [],
    };

    res.json({
      success: true,
      data: normalizedData,
    });
  } catch (error) {
    console.error('Error fetching content:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// 히어로 섹션 업데이트
router.patch('/hero', async (req: AuthRequest, res: Response) => {
  try {
    const { imageUrls, subtitle, title, buttonText, buttonLink } = req.body;

    let content = await Content.findOne();
    if (!content) {
      content = new Content({});
      await content.save(); // 새 Content 먼저 저장하여 기본값 초기화
    }

    // heroSection이 undefined일 수 있으므로 안전하게 접근
    const existingHeroObj = (content.heroSection as any) || {};

    // 기존 imageUrl (단수)이 있으면 imageUrls로 마이그레이션
    let existingImageUrls: string[] = [];
    if (existingHeroObj.imageUrls && Array.isArray(existingHeroObj.imageUrls)) {
      existingImageUrls = existingHeroObj.imageUrls;
    } else if (existingHeroObj.imageUrl && typeof existingHeroObj.imageUrl === 'string' && existingHeroObj.imageUrl.trim() !== '') {
      existingImageUrls = [existingHeroObj.imageUrl];
    }

    // 새 heroSection 설정 (imageUrl 필드 제거, imageUrls만 사용)
    content.heroSection = {
      imageUrls: imageUrls ?? existingImageUrls,
      subtitle: subtitle ?? existingHeroObj.subtitle ?? '',
      title: title ?? existingHeroObj.title ?? '',
      buttonText: buttonText ?? existingHeroObj.buttonText ?? '',
      buttonLink: buttonLink ?? existingHeroObj.buttonLink ?? '',
    };

    // 기존 imageUrl 필드가 있으면 제거 (MongoDB에서 직접 제거)
    if (existingHeroObj.imageUrl !== undefined) {
      await Content.updateOne(
        { _id: content._id },
        { $unset: { 'heroSection.imageUrl': 1 } }
      );
    }

    await content.save();

    res.json({
      success: true,
      message: '히어로 섹션이 업데이트되었습니다.',
      data: content.heroSection,
    });
  } catch (error) {
    console.error('Error updating hero section:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// 학교별 합격자 업데이트
router.put('/school-passers', async (req: AuthRequest, res: Response) => {
  try {
    const { schoolPassers } = req.body;

    let content = await Content.findOne();
    if (!content) {
      content = new Content({});
    }

    content.schoolPassers = schoolPassers.map((item: any, index: number) => ({
      ...item,
      order: item.order ?? index,
    }));

    await content.save();

    res.json({
      success: true,
      message: '학교별 합격자가 업데이트되었습니다.',
      data: content.schoolPassers,
    });
  } catch (error) {
    console.error('Error updating school passers:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// 유튜브 영상 업데이트
router.put('/youtube-videos', async (req: AuthRequest, res: Response) => {
  try {
    const { youtubeVideos } = req.body;

    let content = await Content.findOne();
    if (!content) {
      content = new Content({});
    }

    content.youtubeVideos = youtubeVideos.map((item: any, index: number) => ({
      ...item,
      order: item.order ?? index,
    }));

    await content.save();

    res.json({
      success: true,
      message: '유튜브 영상이 업데이트되었습니다.',
      data: content.youtubeVideos,
    });
  } catch (error) {
    console.error('Error updating youtube videos:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// 강사진 업데이트
router.put('/instructors', async (req: AuthRequest, res: Response) => {
  try {
    const { instructors } = req.body;

    let content = await Content.findOne();
    if (!content) {
      content = new Content({});
    }

    content.instructors = instructors.map((item: any, index: number) => ({
      ...item,
      order: item.order ?? index,
    }));

    await content.save();

    res.json({
      success: true,
      message: '강사진이 업데이트되었습니다.',
      data: content.instructors,
    });
  } catch (error) {
    console.error('Error updating instructors:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// 인스타그램 포스트 업데이트
router.put('/instagram-posts', async (req: AuthRequest, res: Response) => {
  try {
    const { instagramPosts } = req.body;

    let content = await Content.findOne();
    if (!content) {
      content = new Content({});
    }

    content.instagramPosts = instagramPosts.map((item: any, index: number) => ({
      ...item,
      order: item.order ?? index,
    }));

    await content.save();

    res.json({
      success: true,
      message: '인스타그램 포스트가 업데이트되었습니다.',
      data: content.instagramPosts,
    });
  } catch (error) {
    console.error('Error updating instagram posts:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// 역대 합격자 업데이트
router.put('/history-passers', async (req: AuthRequest, res: Response) => {
  try {
    const { historyPassers } = req.body;

    let content = await Content.findOne();
    if (!content) {
      content = new Content({});
    }

    content.historyPassers = historyPassers.map((item: any, index: number) => ({
      ...item,
      order: item.order ?? index,
    }));

    await content.save();

    res.json({
      success: true,
      message: '역대 합격자가 업데이트되었습니다.',
      data: content.historyPassers,
    });
  } catch (error) {
    console.error('Error updating history passers:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

export default router;
