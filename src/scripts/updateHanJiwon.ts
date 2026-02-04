import 'dotenv/config';
import connectDB from '../config/database';
import Instructor from '../models/Instructor';

async function updateHanJiwon() {
  try {
    await connectDB();
    console.log('MongoDB 연결 성공');

    const result = await Instructor.updateOne(
      { name: '한지원' },
      {
        $set: {
          detailSections: [
            {
              title: '학력',
              items: [
                '한국예술종합학교 전통예술원 무용과 학사 졸업',
                '연세대학교 일반대학원 석사 졸업',
                '상명대학교 일반대학원 박사 재학',
              ],
            },
            {
              title: '경력사항',
              items: [
                '前 서울예술단 연수단원',
                '前 서울공연예술 고등학교 무용입시 강사',
              ],
            },
          ],
        },
      }
    );

    if (result.matchedCount > 0) {
      console.log('✓ 한지원: 상세 정보 업데이트 완료');
    } else {
      console.log('✗ 한지원: DB에서 찾을 수 없음');
    }

    const totalCount = await Instructor.countDocuments({ isDeleted: { $ne: true } });
    console.log(`\n총 강사 수: ${totalCount}명`);

    process.exit(0);
  } catch (error) {
    console.error('업데이트 실패:', error);
    process.exit(1);
  }
}

updateHanJiwon();
