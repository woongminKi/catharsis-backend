import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from '../config/database';
import Instructor from '../models/Instructor';

// S3 이미지 URL 생성 헬퍼
const S3_BASE_URL = 'https://catharsis-image.s3.ap-northeast-2.amazonaws.com';

// NFD 변환 (한글 호환성)
const toNFD = (str: string): string => str.normalize('NFD');

const getS3ImageUrl = (path: string): string => {
  const nfdPath = toNFD(path);
  return `${S3_BASE_URL}/${encodeURIComponent(nfdPath).replace(/%2F/g, '/')}`;
};

// 강사 이름 -> 이미지 파일명 매핑
const instructorImageMap: Record<string, string> = {
  // Leaders
  '김동길': '강사 사진/김동길 연기.jpg',
  '이호협': '강사 사진/이호협 연기.jpg',
  '유현도': '강사 사진/유현도 연기.jpg',

  // Acting
  '장서아': '강사 사진/장서아 연기.jpeg',
  '박찬진': '강사 사진/박찬진 연기.jpg',
  '박준혁': '강사 사진/박준혁 연기.jpg',
  '박선영': '강사 사진/박선영 연기.jpg',
  '양주원': '강사 사진/양주원 연기.jpg',
  '김동일': '강사 사진/김동일 연기.jpg',
  '박성민': '강사 사진/박성민 연기.jpg',
  '정윤후': '강사 사진/정윤후 연기.jpg',
  '박지우': '강사 사진/박지우 연기.jpg',

  // Musical
  '임혜란': '강사 사진/임혜란 뮤지컬.jpg',
  '강세화': '강사 사진/강세화 뮤지컬.jpg',

  // Dance
  '한지원': '강사 사진/한지원 무용.jpg',
};

async function updateInstructorImages() {
  try {
    await connectDB();
    console.log('MongoDB 연결 성공');

    let updatedCount = 0;
    let notFoundCount = 0;

    for (const [name, imagePath] of Object.entries(instructorImageMap)) {
      const imageUrl = getS3ImageUrl(imagePath);

      const result = await Instructor.updateOne(
        { name },
        { $set: { profileImages: [imageUrl] } }
      );

      if (result.matchedCount > 0) {
        console.log(`✓ ${name}: 이미지 업데이트 완료`);
        updatedCount++;
      } else {
        console.log(`✗ ${name}: DB에서 찾을 수 없음`);
        notFoundCount++;
      }
    }

    console.log(`\n업데이트 완료: ${updatedCount}명`);
    if (notFoundCount > 0) {
      console.log(`찾지 못함: ${notFoundCount}명`);
    }

    // 이미지가 없는 강사 확인
    const noImageInstructors = await Instructor.find({
      $or: [
        { profileImages: { $exists: false } },
        { profileImages: { $size: 0 } }
      ]
    }).select('name category');

    if (noImageInstructors.length > 0) {
      console.log('\n이미지가 없는 강사:');
      noImageInstructors.forEach(i => {
        console.log(`  - ${i.name} (${i.category})`);
      });
    }

    process.exit(0);
  } catch (error) {
    console.error('업데이트 실패:', error);
    process.exit(1);
  }
}

updateInstructorImages();
