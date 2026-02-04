import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from '../config/database';
import Instructor from '../models/Instructor';

// S3 이미지 URL 생성 헬퍼
const S3_BASE_URL = 'https://catharsis-image.s3.ap-northeast-2.amazonaws.com';
const toNFD = (str: string): string => str.normalize('NFD');
const getS3ImageUrl = (path: string): string => {
  const nfdPath = toNFD(path);
  return `${S3_BASE_URL}/${encodeURIComponent(nfdPath).replace(/%2F/g, '/')}`;
};

// 새로 추가된 강사들의 이미지 매핑
const instructorImageMap: Record<string, string> = {
  '김승섭': '강사 사진/김승섭 연기.png',
  '박현수': '강사 사진/박현수 연기.jpg',
  '윤희재': '강사 사진/윤희재 연기.jpg',
  '서은영': '강사 사진/서은영 연기.jpg',
  '조영래': '강사 사진/조영래 연기.jpg',
  '민병재': '강사 사진/민병재 연기.jpg',
  '윤경': '강사 사진/윤경 연기.jpg',
  '조예림': '강사 사진/조예림 연기.jpg',
  '정현지': '강사 사진/정현지 연기.jpg',
  '김민아': '강사 사진/김민아 연기.png',
  // 기존에 이미지 없었던 김연수도 추가
  '김연수': '강사 사진/김연수 연기.jpg',
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
      isDeleted: { $ne: true },
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
    } else {
      console.log('\n모든 강사에게 이미지가 설정되어 있습니다.');
    }

    process.exit(0);
  } catch (error) {
    console.error('업데이트 실패:', error);
    process.exit(1);
  }
}

updateInstructorImages();
