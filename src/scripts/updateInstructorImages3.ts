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

// 뮤지컬파트 강사들의 이미지 매핑
const instructorImageMap: Record<string, string> = {
  '이지우': '강사 사진/이지우 뮤지컬.jpg',
  '임다인': '강사 사진/임다인 뮤지컬.jpg',
  '한가람': '강사 사진/한가람 뮤지컬.png',
  '권다빈': '강사 사진/권다빈 뮤지컬.jpg',
  '김민정': '강사 사진/김민정 뮤지컬.jpg',
  '최성은': '강사 사진/최성은 뮤지컬.jpg',
  '구자룡': '강사 사진/구자룡 뮤지컬.jpg',
  '지민영': '강사 사진/지민영 뮤지컬.jpg',
  '김채원': '강사 사진/김채원 뮤지컬.jpg',
  '윤호정': '강사 사진/윤호정 뮤지컬.jpg',
  '최지영': '강사 사진/최지영 뮤지컬.jpg',
  // 강세화는 이미 이미지가 있지만 확인용으로 추가
  '강세화': '강사 사진/강세화 뮤지컬.jpg',
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
