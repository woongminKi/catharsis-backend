import { Router, Request, Response } from 'express';
import Content from '../models/Content';

const router = Router();

// 홈페이지 콘텐츠 조회 (공개)
router.get('/', async (req: Request, res: Response) => {
  try {
    // .lean()으로 MongoDB 원본 데이터 조회 (스키마 변환 없이)
    let contentObj = await Content.findOne().lean() as any;

    // 콘텐츠가 없으면 기본값 생성
    if (!contentObj) {
      const newContent = new Content({});
      await newContent.save();
      contentObj = await Content.findOne().lean() as any;
    }

    // imageUrl (단수) 또는 imageUrls (복수) 둘 다 처리
    // 기존 DB에 imageUrl로 저장된 경우를 위한 마이그레이션 처리
    let heroImageUrls: string[] = [];
    if (contentObj.heroSection?.imageUrls && Array.isArray(contentObj.heroSection.imageUrls)) {
      heroImageUrls = contentObj.heroSection.imageUrls;
    } else if (contentObj.heroSection?.imageUrl && typeof contentObj.heroSection.imageUrl === 'string' && contentObj.heroSection.imageUrl.trim() !== '') {
      // 단수 imageUrl이 있으면 배열로 변환
      heroImageUrls = [contentObj.heroSection.imageUrl];
    }

    // instructors를 order 기준으로 정렬
    const sortedInstructors = (contentObj.instructors || []).sort(
      (a: any, b: any) => (a.order ?? 0) - (b.order ?? 0)
    );

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
      instructors: sortedInstructors,
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

export default router;
