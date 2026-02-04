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

// 새로 추가할 뮤지컬파트 강사 데이터
const newInstructorsData = [
  {
    name: '이지우',
    position: '홍대점 뮤지컬파트',
    education: '중앙대학교 연극학과',
    category: 'musical' as const,
    profileImages: [getS3ImageUrl('강사 사진/이지우 뮤지컬.jpg')],
    order: 3,
    isActive: true,
    detailSections: [
      {
        title: '학력',
        items: ['중앙대학교 연극학과 졸업'],
      },
      {
        title: '레슨경력',
        items: [
          '前 짓액팅 뮤지컬강사',
          '前 113Acting studio 뮤지컬강사',
          '카타르시스연기학원 홍대점 뮤지컬강사',
          '외 개인레슨 다수',
        ],
      },
      {
        title: '레슨경력',
        items: [
          '2019 낭독 뮤지컬 예화전 (예화 역)',
          '2021 연극 아마데우스 (스윙)',
          '2021 뮤지컬 광화문연가 (앙상블)',
          '2021 아디오스 콘서트 차지연 x 손준호 (코러스)',
          '2022 쇼케이스 뮤지컬 리파카무랑 (파비사 역)',
        ],
      },
    ],
  },
  {
    name: '임다인',
    position: '뮤지컬파트',
    education: '중앙대학교 연극학과 뮤지컬전공',
    category: 'musical' as const,
    profileImages: [getS3ImageUrl('강사 사진/임다인 뮤지컬.jpg')],
    order: 4,
    isActive: true,
    detailSections: [
      {
        title: '학력',
        items: ['중앙대학교 연극학과'],
      },
      {
        title: '레슨경력',
        items: ['개인레슨 다수'],
      },
      {
        title: '작품이력',
        items: [
          '2019 뮤지컬 <엄마는 열여섯>',
          '2020 웹뮤지컬드라마 <Good Night>',
          '2021 뮤지컬 <곤투모로우>',
          '2022 뮤지컬 <서편제>',
          '2023 뮤지컬 <크레딧>',
        ],
      },
    ],
  },
  {
    name: '한가람',
    position: '뮤지컬파트',
    education: '중앙대학교 연극학과 뮤지컬전공',
    category: 'musical' as const,
    profileImages: [getS3ImageUrl('강사 사진/한가람 뮤지컬.png')],
    order: 5,
    isActive: true,
    detailSections: [
      {
        title: '학력',
        items: ['중앙대학교 연극학과'],
      },
      {
        title: '레슨',
        items: [
          '카타르시스 연기학원 뮤지컬강사',
          '개인레슨 및 예중생 레슨 2년',
        ],
      },
      {
        title: '공연',
        items: [
          '2021 뮤지컬 태양의노래',
          '2020 뮤지컬 다니엘',
        ],
      },
      {
        title: '수상',
        items: [
          '2019 h-star 페스티벌 <선감학원> / 우수상',
          '2017 동아뮤지컬콩쿨 / 장려상',
          '2017 딤프뮤지컬페스티벌 / 우수상',
        ],
      },
    ],
  },
  {
    name: '권다빈',
    position: '뮤지컬파트',
    education: '중앙대학교 연극학과 뮤지컬전공',
    category: 'musical' as const,
    profileImages: [getS3ImageUrl('강사 사진/권다빈 뮤지컬.jpg')],
    order: 6,
    isActive: true,
    detailSections: [
      {
        title: '학력',
        items: ['중앙대학교 연극학과 뮤지컬전공'],
      },
      {
        title: '레슨경력',
        items: [
          '현) 카타르시스 연기학원 강사',
          '전) 짓액팅연기학원 강사',
          '전) 113studio 강사',
          '개인레슨 외 다수',
        ],
      },
      {
        title: '주요경력',
        items: [
          '2023 뮤지컬 <파과> 어린투우 / 해니 역',
          '2023 연극 <쉬는시간> 반장 역',
          '2022 뮤지컬 <블루헬멧 : 메이사의 노래> 아이사 역',
          '2021 뮤지컬 <메이사의 노래> 아이사 역',
        ],
      },
    ],
  },
  {
    name: '김민정',
    position: '뮤지컬 파트',
    education: '서경대학교 공연예술학부 뮤지컬전공',
    category: 'musical' as const,
    profileImages: [getS3ImageUrl('강사 사진/김민정 뮤지컬.jpg')],
    order: 7,
    isActive: true,
    detailSections: [
      {
        title: '학력',
        items: [
          '안양예술고등학교 연극영화과 졸업',
          '서경대학교 공연예술학부 뮤지컬전공 졸업',
        ],
      },
      {
        title: '레슨경력',
        items: [
          '본스타 (안양 캠퍼스 지점) 입시 연기, 뮤지컬 강사',
          '스텔라 뮤지컬 학원 뮤지컬 강사',
          '개인레슨 다수',
        ],
      },
      {
        title: '경력사항',
        items: [
          '뮤지컬 헤어스프레이 (트레이시 역)',
          '뮤지컬 지붕위의 바이올린 (하바 역)',
          '뮤지컬 스핏파이어 그릴 (한나 역)',
          '뮤지컬 웨딩싱어 (앵지 역)',
          '연극 시련 (엘리자베스 역)',
        ],
      },
      {
        title: '작품',
        items: ['넷플릭스 (원 테이크 / 악동뮤지션 편) 군무 역'],
      },
    ],
  },
  {
    name: '최성은',
    position: '뮤지컬파트',
    education: '중앙대학교 성악과',
    category: 'musical' as const,
    profileImages: [getS3ImageUrl('강사 사진/최성은 뮤지컬.jpg')],
    order: 8,
    isActive: true,
    detailSections: [
      {
        title: '학력',
        items: [
          '중앙대학교 성악과 학사졸업',
          '단국대학교 문화예술대학원 공연예술학과',
        ],
      },
      {
        title: '레슨경력',
        items: [
          '현 카타르시스 보컬 강사',
          '제스트 연기학원 강사',
          'A&B 연극영화학원 강사',
          '줄리어드 음악학원 강사',
          '리즈 뮤직 스쿨 강사',
        ],
      },
      {
        title: '주요경력',
        items: [
          'KBS 불후의 명곡 조용필 50주년 특집편 출연',
          '대한민국 신인 음악 콩쿠르 3위',
          '대한민국 한복모델 선발대회 기념공연',
          '롯데콘서트홀 보헤미안 랩소디',
          '롯데콘서트홀 중앙대학교 동문음악회',
          '창작뮤지컬 명예 출연',
          '뮤지컬 마법의 교 출연',
        ],
      },
      {
        title: '자격사항',
        items: ['아이다 아카데미 디플로마 수료'],
      },
    ],
  },
  {
    name: '구자룡',
    position: '뮤지컬파트',
    education: '중앙대학교 성악과',
    category: 'musical' as const,
    profileImages: [getS3ImageUrl('강사 사진/구자룡 뮤지컬.jpg')],
    order: 9,
    isActive: true,
    detailSections: [
      {
        title: '학력',
        items: ['중앙대학교 성악과 졸업'],
      },
      {
        title: '합격생',
        items: ['서울예술대학, 한양대, 경기대, 경희대, 단국대, 서경대, 한세대 등 다수의 연극영화과'],
      },
      {
        title: '경력',
        items: [
          '前 H2 Sensation 입시학원 뮤지컬 트레이너',
          '前 배우앤배움 입시센터 뮤지컬 트레이너',
          '前 법 연기학원 뮤지컬 트레이너',
          '現 충무성결교회 1부 베이스 솔리스트',
          '現 덕원중학교 뮤지컬 트레이너',
          '現 한민고등학교 뮤지컬/성악 트레이너',
          '現 레이아트 연기뮤지컬학원 뮤지컬 트레이너',
          "現 뮤지컬 팀 'MusicaLine' 멤버",
          "現 팝페라 그룹 'Attire Voice' 멤버",
        ],
      },
      {
        title: '주요경력',
        items: [
          '전국 학생 음협 콩클 최우수상 수상',
          "오페라 <Rigoletto>, <L'elisir d'amore>",
          '육군 군악대 뮤지컬/성악병 전역',
          'MBC 2011 DMZ 평화콘서트',
          '2012, 2015 두산 신년음악회',
          '서울 에듀필 오케스트라, 금천 필하모닉 오케스트라, 김포심포니 오케스트라 협연',
          '퍼포먼스 공연 <이상한나라의 앨리스> - 예술무대 산',
          '뮤지컬 갈라 <Joy with the Musical> - MusicaLine',
        ],
      },
    ],
  },
  {
    name: '지민영',
    position: '홍대점 뮤지컬파트',
    education: '연세대학교 성악과 졸업',
    category: 'musical' as const,
    profileImages: [getS3ImageUrl('강사 사진/지민영 뮤지컬.jpg')],
    order: 10,
    isActive: true,
    detailSections: [
      {
        title: '경력',
        items: [
          '연세대학교(신촌) 성악과 졸업',
          'International Phonetic Association 및 음성학 수료',
        ],
      },
      {
        title: '레슨경력',
        items: [
          '2014~2016 파주시립예술단 비상임단원',
          '2015 성남시립예술단 객원단원',
          '2018~2022 구리시립예술단 수석단원',
          '2020~2023 연기학원 뮤지컬 강사',
          '2023~ 찾아가는 진로직업 체험캠프 전임강사',
          '2023~ 구리시립예술단 단원',
        ],
      },
      {
        title: '공연',
        items: [
          '2015 아가씨와 건달들, 오페라의 유령 앙상블',
          '2018 세계로 떠나는 재즈 여행 "멕시코"편 녹음, 녹화',
          '2019 영웅-안중근 레 미제라블-장발장 갈라 콘서트',
          '2020 황태자 루돌프, 맨 오브 라만차 메인 넘버 콘서트',
          '2021 겨울 나그네(1997) 메인 넘버 콘서트, Misty(Ella Fitzgerald) 녹음, 녹화',
          '2022 뮤지컬 무용극 TAAL OST 메인 넘버 콘서트',
          '2023 올드팝 콘서트, 오페라의 유령 갈라 콘서트',
        ],
      },
    ],
  },
  {
    name: '김채원',
    position: '뮤지컬파트',
    education: '국민대학교 성악과',
    category: 'musical' as const,
    profileImages: [getS3ImageUrl('강사 사진/김채원 뮤지컬.jpg')],
    order: 11,
    isActive: true,
    detailSections: [
      {
        title: '학력',
        items: [
          'KBS어린이 합창단 출신',
          '안양예술고등학교 음악과 (성악) 졸업',
          '국민대학교 음악과 성악전공 졸업',
        ],
      },
      {
        title: '레슨경력',
        items: [
          'MBC문화센타 성악발성클리닉 강의',
          'CTS 어린이 합창단 지휘자',
          'AL 뮤지컬 전문입시학원 강사',
          'CNC 입시학원 강사',
          '현) TI 뮤지컬 입시 강사(2013~)',
          '2002~현재) 안산시립합창단 소프라노 상임단원으로 활동중',
        ],
      },
      {
        title: '주요경력',
        items: [
          '2002(IFCM) 미네아 폴리스 세계합창 심포지움 초청연주',
          '2006) 미국 몬타나주 국제합창페스티발 초청연주',
          '2011) 바티칸 교황청 초청(성베드로 대성당 연주)',
          '2012) 미국 시애틀 NWACDA 컨퍼런스 독일 슈투트가르트 챔버 연주',
          '2015) 미국 Salt Lake City 2015 ACDA National Conference 연주',
          '2017) 스페인 바르셀로나 제11회 세계합창 심포지엄 한국대표 초청 연주',
          '2019) 미국 ACDA 캔자스 초청 연주(2.23-3.6)',
        ],
      },
    ],
  },
  {
    name: '윤호정',
    position: '홍대점 뮤지컬파트',
    education: '동국대학교 연극학부 뮤지컬전공',
    category: 'musical' as const,
    profileImages: [getS3ImageUrl('강사 사진/윤호정 뮤지컬.jpg')],
    order: 12,
    isActive: true,
    detailSections: [
      {
        title: '학력',
        items: ['동국대학교 연극학부 뮤지컬 전공 졸업'],
      },
      {
        title: '교육 경력',
        items: [
          '톤연기학원 뮤지컬 강사',
          '쓰리에스연기학원 뮤지컬 강사',
        ],
      },
      {
        title: '작품경력',
        items: [
          '뮤지컬 올숍업-로레인 역',
          '뮤지컬 플라이투더문 -옥토 역',
          '연극 밀바닥에서- 바실리사 역',
          "연극 '돌아온다'- 아내 역",
          "연극 '블랙 코미디'-클레어 역",
          '연극 찬스-예자 역',
          '영화 임금님의 사건수첩-궁녀 역',
          '단편영화 "여친 없는 남자" -여친 역',
          '단편영화 "보부상" - 이유 역',
          '뮤직비디오 "mbti 소개팅" -여자친구 역',
        ],
      },
    ],
  },
  {
    name: '최지영',
    position: '홍대점 뮤지컬파트',
    education: '중앙대학교 성악과',
    category: 'musical' as const,
    profileImages: [getS3ImageUrl('강사 사진/최지영 뮤지컬.jpg')],
    order: 13,
    isActive: true,
    detailSections: [
      {
        title: '학력',
        items: [
          '충북예술고등학교 성악 전공',
          '중앙대학교 음악학부 성악과 학사',
        ],
      },
      {
        title: '작품활동',
        items: [
          "뮤지컬 '루나틱', '문준경',",
          "'용목이의편지' 외 다수",
        ],
      },
      {
        title: '경력사항',
        items: [
          "CTS 'K-가스펠' 3차 진출,",
          '아티스트랩 보컬 프로젝트 대상',
          '롯데호텔 뮤지컬 갈라, 뮤지컬 살롱콘서트, 노들 불꽃축제, 김포 심포니 오케스트라 협연 외 행사 다수',
        ],
      },
    ],
  },
];

// 기존 강사 업데이트 데이터 (강세화 - 더 상세한 정보로 업데이트)
const updateKangSehwa = {
  name: '강세화',
  detailSections: [
    {
      title: '학력',
      items: [
        '서경대학교 대학원 문화예술학과 뮤지컬전공',
        '서경대학교 뮤지컬학과 졸업',
      ],
    },
    {
      title: '교육 경력',
      items: [
        '통액터스 연기학원 뮤지컬강사',
        '톤 연기학원 뮤지컬강사',
        '투 연기학원 뮤지컬강사',
        '서경대학교 뮤지컬학과 교육조교',
      ],
    },
    {
      title: '뮤지컬',
      items: [
        '2022 뮤지컬 이페르의 아이',
        '2019 뮤지컬 <캣조르바>',
        '2019 뮤지컬 <크리스마스 캐롤>',
      ],
    },
    {
      title: '영화',
      items: [
        "2023 단편영화 '살아지는'",
        "2022 부천국제영화제 당선작 'The Rooms'",
      ],
    },
  ],
};

async function seedInstructors3() {
  try {
    await connectDB();
    console.log('MongoDB 연결 성공');

    // 1. 새 강사 추가
    console.log('\n=== 새 뮤지컬파트 강사 추가 ===');
    let addedCount = 0;
    let skippedCount = 0;

    for (const instructor of newInstructorsData) {
      const existing = await Instructor.findOne({ name: instructor.name });
      if (existing) {
        console.log(`✗ ${instructor.name}: 이미 존재함 - 건너뜀`);
        skippedCount++;
      } else {
        await Instructor.create(instructor);
        console.log(`✓ ${instructor.name}: 추가 완료`);
        addedCount++;
      }
    }

    // 2. 강세화 정보 업데이트
    console.log('\n=== 기존 강사 업데이트 ===');
    const kangResult = await Instructor.updateOne(
      { name: '강세화' },
      { $set: { detailSections: updateKangSehwa.detailSections } }
    );
    if (kangResult.matchedCount > 0) {
      console.log('✓ 강세화: 상세 정보 업데이트 완료');
    } else {
      console.log('✗ 강세화: DB에서 찾을 수 없음');
    }

    // 3. 통계 출력
    const totalCount = await Instructor.countDocuments({ isDeleted: { $ne: true } });
    const stats = await Instructor.aggregate([
      { $match: { isDeleted: { $ne: true } } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);

    console.log(`\n=== 결과 요약 ===`);
    console.log(`추가: ${addedCount}명, 건너뜀: ${skippedCount}명`);

    console.log(`\n=== 전체 통계 ===`);
    console.log(`총 강사 수: ${totalCount}명`);
    stats.forEach((s) => {
      const label =
        s._id === 'leader'
          ? '대표/원장'
          : s._id === 'acting'
          ? '액팅파트'
          : s._id === 'musical'
          ? '뮤지컬파트'
          : '움직임파트';
      console.log(`  ${label}: ${s.count}명`);
    });

    process.exit(0);
  } catch (error) {
    console.error('시드 작업 실패:', error);
    process.exit(1);
  }
}

seedInstructors3();
