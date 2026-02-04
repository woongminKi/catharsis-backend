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

// 새로 추가할 강사 데이터
const newInstructorsData = [
  {
    name: '김승섭',
    position: '액팅파트',
    education: '동국대학교 연극학부 연기전공',
    category: 'acting' as const,
    profileImages: [getS3ImageUrl('강사 사진/김승섭 연기.png')],
    order: 11,
    isActive: true,
    detailSections: [
      {
        title: '학력',
        items: ['동국대학교 연극학부 연기전공'],
      },
      {
        title: '경력사항',
        items: [
          '짓 액팅 스튜디오 연기강사',
          '개인레슨 다수',
        ],
      },
      {
        title: '경력사항',
        items: [
          '(연극)12인의 성난사람들',
          '(연극)뻘',
          '(연극)검찰관',
          '(연극) 올모스트 메인',
          '(뮤지컬) 렌트',
          '(뮤지컬) 케익이몽',
        ],
      },
    ],
  },
  {
    name: '박현수',
    position: '액팅파트',
    education: '중앙대학교 연극학과 연기전공',
    category: 'acting' as const,
    profileImages: [getS3ImageUrl('강사 사진/박현수 연기.jpg')],
    order: 12,
    isActive: true,
    detailSections: [
      {
        title: '학력',
        items: ['중앙대학교 연극학과 연기전공'],
      },
      {
        title: '경력',
        items: [
          '프라임연기학원',
          '개인레슨 다수',
        ],
      },
      {
        title: '연극',
        items: [
          '소리별이야기',
          'The Three',
          '작은집을 불태우는 일',
          '신의 막내딸 아네모네',
          '밀바닥에서',
        ],
      },
      {
        title: '독립영화/단편영화',
        items: [
          '아버지의 강',
          '영혼은 달팽이의 속도로 움직인다',
          'Sping, string',
          '지구멸망',
          'OOOO _ 제 18회 서울국제청소년 영화제',
          '태권소녀 _ 제 17회 부산독립 영화제',
        ],
      },
      {
        title: '수상',
        items: ['제 7회 방송미디어 연기자 콘테스트_ 방송단체장상'],
      },
      {
        title: '수료',
        items: ["영국 The Actors Centre 'Method Acting workshop"],
      },
    ],
  },
  {
    name: '윤희재',
    position: '액팅파트',
    education: '중앙대학교 연극학과 연기전공',
    category: 'acting' as const,
    profileImages: [getS3ImageUrl('강사 사진/윤희재 연기.jpg')],
    order: 13,
    isActive: true,
    detailSections: [
      {
        title: '학력',
        items: ['중앙대학교 연극학과 연기전공'],
      },
      {
        title: '경력',
        items: [
          '현 카타르시스 연기학원 강사',
          '짓 액팅 스튜디오 연기 강사',
          '113acting studio 입시 강사',
          '개인레슨 외 다수',
        ],
      },
      {
        title: '연극',
        items: [
          '2024 <한여름 밤의 꿈> 플루트',
          '2024 <저편의 영원> 베로니카, 세다',
          '2023 <그을린 사랑> 나왈',
        ],
      },
    ],
  },
  {
    name: '서은영',
    position: '홍대점 액팅파트',
    education: '중앙대학교 연극학과 연기전공',
    category: 'acting' as const,
    profileImages: [getS3ImageUrl('강사 사진/서은영 연기.jpg')],
    order: 14,
    isActive: true,
    detailSections: [
      {
        title: '학력',
        items: ['중앙대학교 연극학과 졸업'],
      },
      {
        title: '레슨경력',
        items: [
          '前 짓액팅 연기강사',
          '前 113Acting studio 연기강사',
          '카타르시스연기학원 홍대점 연기강사',
        ],
      },
      {
        title: '경력사항',
        items: [
          '2017 연극 밀바닥에서',
          '2017 연극 클라우드 나인',
          '2020 사천의 선인',
          '2021 푸르른 날에',
          '뮤직비디오 딥사워_SUMMER(Feat.JEEBANOFF, GEORGE)',
          '2018 미스춘향선발대회 속 수상',
        ],
      },
      {
        title: '드라마',
        items: [
          '2020 산후조리원 _ 여직원1 역',
          '2021 너는 나의 봄 _ 소개팅녀 역',
          '2021 아침이 밝아올 때까지 _ 여은정 역',
          '2021 드라마 스페셜, 그녀들 _ 권민 역(주연)',
        ],
      },
      {
        title: '영화',
        items: [
          '2021 해피뉴이어',
          '2020 카브리올레',
          '2018 바보멘터리(단편)',
          '2018 피해자(단편)',
          '2018 정리(단편)',
          '2018 늘 밝혀 줄게요(단편)',
        ],
      },
    ],
  },
  {
    name: '조영래',
    position: '액팅파트',
    education: '중앙대학교 연극학과',
    category: 'acting' as const,
    profileImages: [getS3ImageUrl('강사 사진/조영래 연기.jpg')],
    order: 15,
    isActive: true,
    detailSections: [
      {
        title: '강사 경력',
        items: [
          '더베스트 이앤엠 - 입시, 아역 연기수업',
          '제이드 컴퍼니 - 고등부 수업',
          '개인레슨 경력 다수',
        ],
      },
      {
        title: 'DRAMA',
        items: [
          '2025 독수리 오형제를 부탁해!',
          '2024 나는 호박이다.',
          '2021 KBS1 숙아도 꿈결 .',
        ],
      },
      {
        title: 'MOVIE',
        items: [
          '2023 커피머신 .',
          '2020 특수요원.',
          '2018 인생은 새옹지마.',
        ],
      },
      {
        title: 'THEATER',
        items: [
          '2024 미지의 세계, 일주역',
          '2024핸드폰 배터리 17%,영진 역',
          '2024판다는 경부고속도로를 달릴 수 없다. 조대리 역',
          '2023 오늘의 요리 - 새벽',
          '2019 (ATEC참가작) <상아성 - 달빛 여인들>',
          '2017 시련',
          '2016 눈뜨는 봄',
          '2016 속살, 상준역',
        ],
      },
      {
        title: 'MODEL',
        items: [
          '광고 모델',
          '2024 드림플러스, 회사원 역',
          '2023 ESG 거버넌스, 회사원역',
          '2022 위대한 상상(요기요), 라이더역',
          '2021 LG 헬로모바일, 신입사원 역',
          'YAP 오더,회사원편',
        ],
      },
      {
        title: 'MEDIA',
        items: [
          '2022 위클리플, 링크하울 남자 진행자',
          '2020 CJENM 피미업 . 남자 진행자',
          '2018 OLVE, 테이스티로드 시즌5',
        ],
      },
    ],
  },
  {
    name: '민병재',
    position: '홍대점 액팅파트 강사',
    education: '동국대학교 연극학부 연기전공',
    category: 'acting' as const,
    profileImages: [getS3ImageUrl('강사 사진/민병재 연기.jpg')],
    order: 16,
    isActive: true,
    detailSections: [
      {
        title: '학력',
        items: [
          '동국대학교 연극학부 연기전공',
          'LATA 라반 액팅 트레이닝 센터 기초 교육 과정 수료',
          'LATA 라반 액팅 트레이닝 센터 심화 교육 과정 수료',
        ],
      },
      {
        title: '공연',
        items: [
          '2021 뮤지컬<메이사의노래> - 부대장 역',
          '2022 연극 - 폴 역',
          '2024 연극<애인> - 강아지 역',
        ],
      },
      {
        title: '영화',
        items: [
          '2024 - 방촌식 역',
          '2024 <기억을 파는 사람들> -진태 역',
          '2025 <단역배우> -현식 역',
          '2025 <바게트> -박민표 역',
        ],
      },
    ],
  },
  {
    name: '윤경',
    position: '홍대점 액팅파트',
    education: '중앙대학교 연극학과 연기전공',
    category: 'acting' as const,
    profileImages: [getS3ImageUrl('강사 사진/윤경 연기.jpg')],
    order: 17,
    isActive: true,
    detailSections: [
      {
        title: '학력',
        items: ['중앙대학교 연극학과 연기전공 졸업'],
      },
      {
        title: '레슨경력',
        items: [
          '前 기업출강 연기지도',
          '前 이엔티 아카데미 무용지도',
          '前 연기로 우주정복 연기지도',
          '前 주 액터스 연기지도',
          '前 KS트레이닝센터 연기지도',
          '현 요가강사',
          '현 Youtube [싱글벙글] 연기 그룹레슨',
          '현 Youtube [다우소] 연기 그룹 레슨',
          '현 카타르시스 연기학원 외 개인레슨 다수',
        ],
      },
      {
        title: '연극',
        items: [
          '북도에서',
          '노란봉투',
          '먼로, 엄마',
          '북도에서, 미성년으로 간다',
          'XXL 레오타드 안나수이손거울',
          '삼풍백화점',
          'GAME',
          '내가 있던 풍경',
          '명왕성에서',
          '날아가 버린 새',
          '지상의 여자들',
          '키리에',
          '고목',
          '아이들(The Children)',
          '외 다수',
        ],
      },
      {
        title: '영화',
        items: [
          '복덕방',
          '개장수',
          '이공삼칠',
          '나의 탐스러운 사생활',
          '대도시의 사랑법',
        ],
      },
      {
        title: '드라마',
        items: [
          'MBC 특별근로감독관 조장풍',
          '카카오TV 빌린 몸',
          'TVN 조선정신과의사 유세풍2',
          'TVN 별들에게 물어봐',
          'NETFLIX 천천히 강렬하게',
        ],
      },
      {
        title: 'M/V',
        items: [
          '널 -Nuz',
          '신청곡 -이소라',
        ],
      },
    ],
  },
  {
    name: '조예림',
    position: '액팅파트',
    education: '중앙대학교 연극학과 연기전공',
    category: 'acting' as const,
    profileImages: [getS3ImageUrl('강사 사진/조예림 연기.jpg')],
    order: 18,
    isActive: true,
    detailSections: [
      {
        title: '학력',
        items: ['중앙대학교 연극학과 연기전공'],
      },
      {
        title: '연극',
        items: [
          '2023 쉬는 시간 - 희정',
          '2021 쉬는 시간 - 희정',
          '2021 진홍빛 소녀 - 은진',
          '2019 곰 - 조신애 역',
        ],
      },
      {
        title: '광고',
        items: [
          '2022 SK매직 생활구독 가전제품',
          '2021 삼성갤럭시 21',
          '2021 기아자동차',
          '2021 인투더언전',
          '2020 파리바게트',
          '2020 아모레퍼시픽 큐브미',
          '2020 처음처럼 순하리 레몬진',
          '2020 투썸플레이스',
          '2020 아크네스',
          '2019 SK뮤직어플 FIO',
          '2018 서브웨이',
        ],
      },
      {
        title: '브랜드 모델',
        items: [
          '2018-9 스파오',
          '2018 바닐라코',
          '2017 페리페라',
        ],
      },
      {
        title: '뮤직비디오',
        items: [
          '2022 V.O.S 김경록 - 모든 만약을 더하면',
          '2018 인피니트 - Tell me',
        ],
      },
    ],
  },
  {
    name: '정현지',
    position: '액팅파트',
    education: '중앙대학교 연극학과 연기전공',
    category: 'acting' as const,
    profileImages: [getS3ImageUrl('강사 사진/정현지 연기.jpg')],
    order: 19,
    isActive: true,
    detailSections: [
      {
        title: '학력',
        items: ['중앙대학교 연극학과 졸업'],
      },
      {
        title: '연기지도',
        items: [
          '2023 몸그리다 키즈뮤지컬 창작뮤지컬 - 각색 - 연출',
          '2023 몸그리다 키즈뮤지컬 초등 연기, 뮤지컬 지도 교사',
          '2023 동성중학교 연극 <아몬드> 드라마터크, 연기지도교사',
          '카타르시스연기학원 연기강사',
          '짓 액팅 스튜디오 연기강사',
          '개인레슨 다수',
        ],
      },
      {
        title: '드라마',
        items: [
          'sbs <수상한가정부>',
          'jtbc <멜롱별>',
          '채널 A <가면의 여왕>',
        ],
      },
      {
        title: '광고',
        items: [
          '삼성 비스포크 에어컨 홈쇼핑',
          '삼성 비스포크 냉장고 홈쇼핑',
        ],
      },
      {
        title: '영화',
        items: [
          '2018 <축배를 들어라> - 현지 역',
          '2018 - 친구 역',
        ],
      },
      {
        title: '연극',
        items: [
          '2019 - 애니 역',
          '2022 <살아있는 이중생 각하> - 하주 역',
          '2022 <페리클레스> - 마리나 역',
          '2023 - 연출 역',
        ],
      },
      {
        title: '뮤지컬 뮤직비디오',
        items: [
          '멜로필름 <완벽한고백> - 여주 역',
          '멜로필름 <크리스마스메들리> - 현지 역',
        ],
      },
    ],
  },
  {
    name: '김민아',
    position: '액팅파트',
    education: '중앙대학교 연극학과 연기전공',
    category: 'acting' as const,
    profileImages: [getS3ImageUrl('강사 사진/김민아 연기.png')],
    order: 20,
    isActive: true,
    detailSections: [
      {
        title: '경력사항',
        items: [
          '前 짓 액팅 스튜디오 연기강사',
          '前 113 스튜디오 연기강사',
          '카타르시스연기학원 연기강사',
          '개인레슨 다수',
        ],
      },
      {
        title: '드라마/영화',
        items: [
          '2023 NETFLIX <퀸메이커>',
          '2023 jtbc <킹더랜드>',
          '2023 ott <오늘도 사랑스럽개>',
          '2022 NETFLIX <소년심판>',
          '2019 OCN <미스터기간제>',
          '2018 SBS <훈남정음>',
          '2018 SBS <이판사판>',
          '2018 TVN <라이브>',
          '2017 SBS <다시만난세계>',
          '2017 KBS <학교 2017>',
          '2016 SBS <미세스캅2>',
          '2011 OCN <신의퀴즈>... 기타등등',
        ],
      },
      {
        title: '연극',
        items: [
          '2019 봄의 노래는 바다에 흐르고',
          '2019 변신',
          '2019 사랑을 외치리',
        ],
      },
    ],
  },
];

// 기존 강사 업데이트 데이터 (김연수 - 더 상세한 정보로 업데이트)
const updateKimYeonsu = {
  name: '김연수',
  detailSections: [
    {
      title: '학력',
      items: ['중앙대학교 연극학과 연기전공'],
    },
    {
      title: '레슨경력',
      items: [
        '현 카타르시스 연기학원 강사',
        '짓 액팅 스튜디오 연기 강사',
        '113acting studio 입시 강사',
        '개인레슨 외 다수',
      ],
    },
    {
      title: '경력사항 - 연극',
      items: [
        '2024<맥베스>/국립극장해오름극장/시튼역',
        '2023<멋진신세계>/대전예술의전당양상블홀/존역',
        '2023<사이렌>/미마지아트센터눈빛극장/지석역',
        '2022<틴에이지딕>/국립극장달오름극장/에디아이비역',
        '2022<신의막내딸아네모네>/상상아트홀/무직남자역',
        '2022<사랑셋>/북촌창우극장/짐역',
      ],
    },
    {
      title: 'TV-드라마',
      items: ['2023<가면의여왕>/안내직원역'],
    },
    {
      title: '영화',
      items: [
        '단편2022<하다보니>/심민규역',
        '단편2017/진우역',
      ],
    },
  ],
};

async function seedInstructors2() {
  try {
    await connectDB();
    console.log('MongoDB 연결 성공');

    // 1. 새 강사 추가
    console.log('\n=== 새 강사 추가 ===');
    for (const instructor of newInstructorsData) {
      const existing = await Instructor.findOne({ name: instructor.name });
      if (existing) {
        console.log(`✗ ${instructor.name}: 이미 존재함 - 건너뜀`);
      } else {
        await Instructor.create(instructor);
        console.log(`✓ ${instructor.name}: 추가 완료`);
      }
    }

    // 2. 김연수 정보 업데이트
    console.log('\n=== 기존 강사 업데이트 ===');
    const kimYeonsuResult = await Instructor.updateOne(
      { name: '김연수' },
      { $set: { detailSections: updateKimYeonsu.detailSections } }
    );
    if (kimYeonsuResult.matchedCount > 0) {
      console.log('✓ 김연수: 상세 정보 업데이트 완료');
    } else {
      console.log('✗ 김연수: DB에서 찾을 수 없음');
    }

    // 3. 통계 출력
    const totalCount = await Instructor.countDocuments({ isDeleted: { $ne: true } });
    const stats = await Instructor.aggregate([
      { $match: { isDeleted: { $ne: true } } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);

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

seedInstructors2();
