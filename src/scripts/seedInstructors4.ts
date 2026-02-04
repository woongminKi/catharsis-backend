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

// 새로 추가할 움직임파트 강사 데이터
const newInstructorsData = [
  {
    name: '최윤희',
    position: '움직임파트',
    education: '수원대학교 무용과',
    category: 'dance' as const,
    profileImages: [getS3ImageUrl('강사 사진/최윤희 무용.png')],
    order: 2,
    isActive: true,
    detailSections: [
      {
        title: '학력',
        items: [
          '계원예술고등학교 무용과 졸업',
          '중앙대학교 공연영상창작학부 무용과 졸업',
          '중앙대학교 대학원 공연예술학과 안무전공 졸업',
        ],
      },
      {
        title: '경력',
        items: [
          '現푼크툼 팍티오 대표',
          '前Collective A',
          '前최상철현대무용단',
          '前중앙대학교 출강',
        ],
      },
      {
        title: '수상',
        items: [
          '2010. 5 중앙대학교 전국 무용 콩쿠르 현대무용부분 전체 대상',
          '2011. 3 중앙대학교 공연영상창작학부 무용전공 수석입학',
          '2012. 5 한국현대무용협회 전국 무용 콩쿠르 시니어 여자부분 1위',
          '2012. 5 동아무용콩쿠르 5위',
          '2015. 3 중앙대학교 대학원 수석입학 및 전액장학생',
        ],
      },
      {
        title: '공연',
        items: [
          '2013. 5 한국현대무용협회 1위 수상작 갈라공연',
          '2014. 5 대전 예술의 전당 야외 공연',
          '2014. 7 FADAF 작품상 공연 출연',
          '2015. 7 FADAF 작품상 갈라 공연 출연',
          '2015. 10 ART PROJECT "SPIN OFF" 안무 및 출연',
          '2015. 11 5th 인천신진작가플랫폼 <나무로켓> 출연',
          '2016. 4 대학원 졸업 개인공연 안무 및 출연',
          '2016. 5 ART PROJECT "SPIN OFF" 출연',
          '2016. 11 오페라 <맥베스> 출연',
          '2017. 5 M극장 신진안무가전 NEXT Ⅱ안무 및 출연',
          '2017. 12 아르코예술극장 대극장 올해의 신작 최상철현대무용단 <혼돈> 출연',
          '2018. 6 광주 국립아시아문화전당 2017최우수작품상수상작 <혼돈> 출연',
          '2018. 10 한국예술인복지재단 파견사업 <연남동회> 기획 및 출연',
          '2018. 12 대한민국무용대상 장관상 수상작 <새빨간 거짓말> 출연',
          '2019. 6 KBS 다큐멘터리 \'실크로드\' 출연',
          '2019. 10 전국장애인체육대회 개막식 출연',
          '2019. 10 서울식물원 <누군가의 식물원> 안무 및 출연',
          '2019. 12 광주 국립아시아문화전당 대형 넘버별 퍼포먼스 <무.사> 출연',
          '2020. 12 서울문화재단 예술활동지원사업 작품 \'더미\' 안무 및 출연',
          '2021. 9 광명문화재단 경기예술활동지원사업 작품 \'더미\' 안무 및 출연',
        ],
      },
      {
        title: '교육 - 학교',
        items: [
          '2020. 3 ~ 안산디자인문화고등학교 공연콘텐츠학과 무용 담당 강사',
          '2021. 3 ~ 광교호수중학교 강사',
          '2014. 7 ~ 2014. 8 안양남초등학교 하계방학 특강 무용 강사',
          '2017. 9 ~ 2018.12 중앙대학교 공연영상학과 무용 강사 출강',
          '2020. 4 ~ 2020. 12 서울광신방송예술고등학교 무용강사',
        ],
      },
      {
        title: '교육 - 학원',
        items: [
          '2014. 11 ~ 2016. 4 안양 더 보이스 컴퍼니 연기학원 무용 강사',
          '2015. 4 ~ 2015. 8 부산 마이플레이스 연기학원 무용 강사',
          '2017. 5 ~ 2017. 8 광교 배우캠JK연기학원 무용 강사',
          '2019. 2 ~ 2019. 12 W.A company 무용 강사',
          '2019. 4 ~ 2020. 1 안양 H.mama연기학원 무용 강사',
          '2020. 2 ~ 2020. 12 에듀액트 연기학원 무용 강사',
          '2021. 1 ~ 2021. 3 안산A2연기학원 무용 강사',
          '2021. 6 ~ 논현 KAAT산연기학원 무용강사',
        ],
      },
      {
        title: '기타',
        items: [
          '2020. 6 ~ 2020. 12 서울문화재단 공연예술 모니터링단',
          '2020. 8 ~ 2020. 12문화체육관광부 문화예술조사단',
        ],
      },
      {
        title: '자격증',
        items: [
          '2015. 3 체육교사 자격증 2급',
          '2015. 10 문화예술교육사 자격증 2급',
        ],
      },
    ],
  },
  {
    name: '박아영',
    position: '움직임파트',
    education: '성균관대학교 무용과',
    category: 'dance' as const,
    profileImages: [getS3ImageUrl('강사 사진/박아영 무용.jpg')],
    order: 3,
    isActive: true,
    detailSections: [
      {
        title: '학력',
        items: [
          '성균관대학교 무용과, 신문방송학과 졸업',
          '성균관대학교 대학원 무용학 석사 졸업',
          '아지드현대무용단 수석무용수',
        ],
      },
      {
        title: '레슨경력',
        items: [
          '前배우 연기학원',
          '前오은령 무용학원',
          '前티아이 연기아카데미 무용입시강사',
          '前인천예술고등학교 무용과 입시강사',
          '前소명여자고등학교 무용강사',
          '현 메리안발레 강사 외 입시 개인레슨 다수',
          '현 카타르시스연기학원 무용강사',
        ],
      },
      {
        title: '출연작',
        items: [
          '2016 코리아국제콩쿨 쥬니어 따라하기 시범',
          '아지드현대무용단 정기공연"하객"',
          '2015아지드현대무용단 정기공연 "인터뷰2"',
          '2014크리스틱초이스 원댄스프로젝트 "기억테스트"',
          '2013 통영국제음악제 폐막공연"윤이상을만나다"',
          '2012 국립현대무용단 국내안무가 초청공연',
          '"최후의 만찬"',
          '2012브누아드라당스 노미네이트 선정작 "윤이상을 만나다"쇼케이스',
          '도시천사,소요,그대안의낙원,자유부2010,2012, 감각의권리 외 다수 출연',
        ],
      },
      {
        title: '안무작',
        items: [
          '2016댄스릴레이 Ⅸ품-"="이퀼[equal],',
          '2011...ing',
          '2009아영이와 수둥이 외 다수안무',
        ],
      },
      {
        title: '수상경력',
        items: ['2016한국무용협회 안무자상 수상'],
      },
    ],
  },
  {
    name: '정유담',
    position: '움직임파트',
    education: '세종대학교 무용과',
    category: 'dance' as const,
    profileImages: [getS3ImageUrl('강사 사진/정유담 무용.jpg')],
    order: 4,
    isActive: true,
    detailSections: [
      {
        title: '학력',
        items: [
          '세종대학교 일반대학원 무용학과 현대무용전공 석사 졸업',
          '세종대학교 일반대학원 무용학과 현대무용전공 박사 재학',
        ],
      },
      {
        title: '레슨경력',
        items: [
          '현 카타르시스연기학원 무용강사',
          '전 3S(쓰리에쓰)연기학원',
          '전 에듀액트(현.가자연기학원)',
          '전 MTM연기학원',
          '전 김민정무용학원',
          '전 로잔발레무용학원',
        ],
      },
      {
        title: '수상경력',
        items: [
          "2017 'DiCFe' 세계안무콩쿠르 단체부문 금상, 솔로부문 동상",
          '2016 DDF(대학생춤축제) 최고작품선정',
          '2015 청주대학교무용경연대회 솔로부문 은상',
          '2015 한국현대무용협회 단체부문 금상, 솔로부문 은상',
        ],
      },
      {
        title: '주요경력',
        items: [
          "2024 창작실험프로젝트 LAUNCH FROM MARS '뇌(brain)' 출연",
          "2024 창작실험프로젝트 LAUNCH FROM MARS '한 개의 겹(A one layer)' 안무 및 출연",
          "2024 제20회 안산국제거리극축제 MarsMent 'Claim(요구)' 출연",
          '2022 함양문화예술회관 창작오페라 <주기철의 일사각오> 출연',
          '2022 제5회 서울국제댄스페스티벌 인 탱크 <Sub-way> 출연',
          '2022 Starfield Coex 별마당 도서관 dance performance <텅빈 시간의 정원 앞에서> 출연',
          '2022 국립극장 창작오페라 <문림> 출연',
          '2021 강동아트센터 Dance Flim <아니무스(Animus)> 출연',
          '2020 제23회 성남 창작무용제 <익숙한 낯설음> 출연',
          '그 외 다수 출연',
        ],
      },
    ],
  },
  {
    name: '김소영',
    position: '움직임파트',
    education: '세종대학교 무용과',
    category: 'dance' as const,
    profileImages: [getS3ImageUrl('강사 사진/김소영 무용.jpg')],
    order: 5,
    isActive: true,
    detailSections: [
      {
        title: '학력',
        items: [
          '세종대학교 무용과 졸업',
          '경북예술고등학교 무용과 졸업',
        ],
      },
      {
        title: '레슨경력',
        items: [
          '현) 카타르시스 연기학원 무용강사',
          '배우앤배움 연기학원 무용강사',
          '솔리 무용학원 강사',
          '경북예술고등학교 특강 강사',
          '액터로드 연기학원 전임 무용강사',
        ],
      },
      {
        title: '주요경력',
        items: [
          '2017 코리아국제무용 콩쿠르 파이널 진출 및 Bronze 입상',
          '2017 서울국제무용 콩쿠르 SIDC 파이널 진출',
          '2017 현대무용협회 콩쿠르 3위',
        ],
      },
    ],
  },
  {
    name: '정지현',
    position: '홍대점 움직임파트',
    education: '세종대학교 무용과',
    category: 'dance' as const,
    profileImages: [getS3ImageUrl('강사 사진/정지현 무용.jpg')],
    order: 6,
    isActive: true,
    detailSections: [
      {
        title: '학력',
        items: [
          '세종대학교 대학원 졸업',
          '서울예술대학교 졸업',
        ],
      },
      {
        title: '경력사항',
        items: [
          '카타르시스연기학원 무용입시 강사',
          '前 엘키드교육 유아체육및 초등체육무용 강사',
          '前 키자니아 예술극단 무용 강사',
          '前 불꽃는아가리 연기학원 무용입시 강사',
          '前 에듀액트 연기학원 무용입시 강사',
          '前 주액터스 연기학원 무용입시 강사',
        ],
      },
      {
        title: '출연경력',
        items: [
          '이광석룸바카 출연',
          'IDCA 무용교류협회 현대무용 최우수상',
          '제12회 전국무용경연대회 금상',
          '전국선사 무용경연대회 최우수상',
          "모다페 '소진된 인간' 출연",
          'DMP 창단공연 Lex tailonus 출연',
          '오페라 아이다 출연',
          '대구 국제2인무 blue hole 출연',
          '전주 넘버별 퍼포먼스 난타 출연',
          "포스트에고 무용단 '이해' 출연",
          '무용극 한여름밤의 꿈 출연',
          "-크리틱스초이스 '운동과 시간의 연속성에 관한 연구' 출연",
          "-불후의영곡 국악특집 송소희팀 '명태' 출연",
          '-kbs 피어나라 대한민국 심수봉 출연',
          '-가면극 시시딱딱 출연 및 조연출',
        ],
      },
    ],
  },
  {
    name: '김기범',
    position: '움직임파트',
    education: '한국예술종합학교 무용과',
    category: 'dance' as const,
    profileImages: [getS3ImageUrl('강사 사진/김기범 무용.jpg')],
    order: 7,
    isActive: true,
    detailSections: [
      {
        title: '학력',
        items: ['한국예술종합학교 실기과 한국무용 졸업'],
      },
      {
        title: '경력사항 - 안무',
        items: [
          '안은미 무용단 전) 단원',
          '두산 아트랩<오빠 믿어!!>',
          '춘천마임축제',
          '아르코 대극장<당첨은 꿈꾸는가?>',
          'SIWF:Riding&Pertprmance릴리 멘도사',
          "정기문화재단 let's DMZ<평화예술제>",
          '국립무용단 <완월>',
          '신라호텔 영빈관<밀라라이츠 페인팅 퍼포먼스>',
        ],
      },
      {
        title: '뮤지컬 조안무',
        items: [
          '두산아트센터 <서편제 초연>',
          '세종문화회관 <광화문 연가 초연>',
        ],
      },
      {
        title: '출연',
        items: [
          '안은미,<맹성마마 프로젝트>,<조상님께 바치는 맨스>,<안심맨스>, 등.',
          '안성수<이상한 나라>',
          '윤성주<그대 눈개여!>',
          '정미영<누구시죠?>',
          '고흥규',
          '김설리<무수막>',
          '남수정<서울 march>',
          '윤승혜<2기류>',
          '박시현<장난>',
          '정영민<이불 속 이야기>',
          '안영준<여섯 번째 movement>',
          "경기문화재단Let's DMZ<평화예술제>",
          '두산아트랩<오빠 믿어!!>',
          '춘천마임축제',
          '<당첨은 꿈꾸는가?>',
          "<국립무용단 '완월'>",
          '밀라라이츠 페인팅 퍼포먼스',
          'SIWF 릴리멘도사',
        ],
      },
    ],
  },
  {
    name: '이정호',
    position: '움직임파트',
    education: '한국예술종합학교 무용과',
    category: 'dance' as const,
    profileImages: [getS3ImageUrl('강사 사진/이정호 무용.png')],
    order: 8,
    isActive: true,
    detailSections: [
      {
        title: '학력',
        items: ['한국예술종합학교 무용원 창작과 학사(예술사) 졸업2020'],
      },
      {
        title: '경력사항',
        items: [
          '2020 한국예술종합학교 산학협력 프로젝트 2팀 감독',
          '2017 사단군악대 복무',
          '2016 한국예술종합학교 플랫폼 지원작 "소금이 녹는시간 연출"',
          '2015 yann Lheureux 연출 프랑스 남부투어 객원 무용수',
          '2014 Dance Elargie 안무 경연대회 초청작, 감독 및 공연',
          '2014 한국예술종합학교 입학',
        ],
      },
    ],
  },
  {
    name: '정다빈',
    position: '움직임파트',
    education: '중앙대학교 무용과',
    category: 'dance' as const,
    profileImages: [getS3ImageUrl('강사 사진/정다빈 무용.jpg')],
    order: 9,
    isActive: true,
    detailSections: [
      {
        title: '학력',
        items: [
          '중앙대학교 무용학과 졸업',
          '중앙대학교 일반대학원 무용실기학과 석사 졸업',
          '중앙대학교 공연영상창작학부 무용전공 및 일반대학원 무용실기학과 교육조교',
        ],
      },
      {
        title: '경력사항',
        items: [
          '2023 안성 일죽도서관 센터 출강',
          '2023 안성 명작동화 어린이집 출강',
          '2022 안성 댄스인데이지 아카데미 출강',
          '2022 광교 롯데마트 문화센터 출강',
          '2021 경기예고 뮤지컬 <AIRPORT BABY> 안무 지도',
          '2021 아이엠뮤지컬 아카데미 출강',
        ],
      },
      {
        title: '활동경력',
        items: [
          "2022 제25회 2022 크리틱스초이스 댄스페스티벌 'Bloody Moon' 출연",
          "2021 제 55회 처용문화제 [최상철댄스프로젝트] '눈물의 무게'",
          "2021 제42회 서울무용제 '볼품품.거기 있는 줄도 몰랐던 너'",
          '2020 모피를 입은 난 여자',
        ],
      },
    ],
  },
  {
    name: '유은비',
    position: '움직임파트',
    education: '중앙대학교 무용과',
    category: 'dance' as const,
    profileImages: [getS3ImageUrl('강사 사진/유은비 무용.jpg')],
    order: 10,
    isActive: true,
    detailSections: [
      {
        title: '학력',
        items: [
          '중앙대학교 무용학과(현대무용) 졸업',
          '중앙대학교 교육대학원 무용교육 졸업',
          '2급 정교사 교원자격증 소지',
        ],
      },
      {
        title: '레슨경력',
        items: [
          '현) 카타르시스 연기학원 무용 강사',
          '현 뚝딱연기학원 무용특기 강사',
          "현 '세종 우리동네 프로젝트' 뮤지컬 안무강사",
          '현 세원고등학교 연극부 현대무용 강사',
          'W.A company 현대무용 강사',
          '슈퍼비 엔터테인먼트 안무강사',
          'KS트레이닝센터 무용특기 강사 외 다수',
        ],
      },
      {
        title: '주요경력',
        items: [
          "2019 Darmstadt Fokus Korea 'Silentium'",
          "2017 창작산실 '혼돈 The Chaos'",
          "2017 부산국제무용제 AK21 '나를 바라보는 너'",
          "2017 C2Dance 무용단 정기공연 'The Room'",
          "2016 Jerusalem International Dance Week 'WAVE'",
          "2016 부산국제무용제 AK21 'WAVE'",
          "2015 Here are their shadows 'Shadows'",
          "2014 서울국제공연예술제 SPAF 국내초청작 'CRY'",
          "2014 문화체육관광부 주최 '관계'",
          "2014 동아시아 문화 중심도시 선포식 개막공연 '외침'",
          "2013 안무가 시리즈 추천작 'Solace'  외 다수",
        ],
      },
    ],
  },
  {
    name: '임지훈',
    position: '움직임파트',
    education: '중앙대학교 무용과',
    category: 'dance' as const,
    profileImages: [getS3ImageUrl('강사 사진/임지훈 무용.jpg')],
    order: 11,
    isActive: true,
    detailSections: [
      {
        title: '학력',
        items: ['중앙대학교 공연영상창작학부(무용학과 / 현대무용) 졸업'],
      },
      {
        title: '경력',
        items: [
          '카타르시스 연기학원 무용강사',
          '한예종 전문사 개인레슨 외 다수',
          '서울예대 학부 개인레슨',
          "'썸바디' 정 연수 연기자 개인레슨",
          '수원 본스타연기학원 입시반 무용강사',
          '인천 본스타연기학원 입시반 무용강사',
          '온더 플레이 연기학원 입시반 무용강사',
          'PARTS 무용학원 현대무용 전공강사',
          '열무용학원 현대무용 입시',
        ],
      },
      {
        title: '수상경력',
        items: [
          'August 29, 2015',
          'Federation of International Dance Festivals, ASIA. -The 3rd',
        ],
      },
      {
        title: '공연경력',
        items: [
          "2023 SM 소속 에스파 aespa 'Drama' 뮤직비디오 무용수 출연",
          "2023 신인안무가 'WORKER' 안무",
          "2019 대학 무용제 '새빨간 거짓말' 출연",
          "2019 'C2 DANCE' - 'KHAN' 솔리스트",
          "2017 창작산실 올해의 안무 '최 상철 무용단' - 'CHAOS' 출연",
          "2015 뮤지컬 '선비' 무용수 출연",
        ],
      },
    ],
  },
  {
    name: '곽은영',
    position: '움직임파트',
    education: '중앙대학교 무용과',
    category: 'dance' as const,
    profileImages: [getS3ImageUrl('강사 사진/곽은영 무용.png')],
    order: 12,
    isActive: true,
    detailSections: [
      {
        title: '학력',
        items: [
          '중앙대학교 공연영상창작학과 현대무용전공 졸업',
          '중앙대학교대학원 문화예술경영학과 공연경연전공 졸업',
        ],
      },
      {
        title: '경력사항',
        items: [
          "15' 예술단체 SPIN OFF 무용수",
          "15' TWINS 공연 기획",
          "16' 세종문화회관 맥베드 공연 오페라 무용수",
          "16' 경기문화재단 어린이 골목예술가 프로젝트 예술 강사",
          '17\' 이천 시민과 함께하는 특전사 "가을 콘서트" 무용수',
          "17' 군포 청소년수련관 방과후 활동 (동학닐락)",
          "18' 러닝베리스엔터테인먼트 무용과 입시",
          "18' 인천생활예술고등학교 근무",
          "18' 레슨포케이아트(입시학원) 무용강사",
          '20\' 극단 "무토" 안무가',
          "16'~ 극예술연기학원 무용강사",
          "18'~ SEO(시)발레단 공연기획",
          "19'~ 초이스드라마스쿨 무용 강사",
        ],
      },
      {
        title: '자격증',
        items: [
          '문화예술교육사 2급(문화체육관광부)',
          '요가지도자 3급(대한사회교육원)',
          '필라테스 지도자[매트] (대한사회교육원)',
        ],
      },
    ],
  },
];

async function seedInstructors4() {
  try {
    await connectDB();
    console.log('MongoDB 연결 성공');

    // 새 강사 추가
    console.log('\n=== 새 움직임파트 강사 추가 ===');
    let addedCount = 0;
    let skippedCount = 0;
    let updatedCount = 0;

    for (const instructor of newInstructorsData) {
      const existing = await Instructor.findOne({ name: instructor.name });
      if (existing) {
        // 기존 데이터 업데이트
        await Instructor.updateOne(
          { name: instructor.name },
          { $set: { detailSections: instructor.detailSections, profileImages: instructor.profileImages } }
        );
        console.log(`✓ ${instructor.name}: 정보 업데이트 완료`);
        updatedCount++;
      } else {
        await Instructor.create(instructor);
        console.log(`✓ ${instructor.name}: 추가 완료`);
        addedCount++;
      }
    }

    // 통계 출력
    const totalCount = await Instructor.countDocuments({ isDeleted: { $ne: true } });
    const stats = await Instructor.aggregate([
      { $match: { isDeleted: { $ne: true } } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);

    console.log(`\n=== 결과 요약 ===`);
    console.log(`추가: ${addedCount}명, 업데이트: ${updatedCount}명, 건너뜀: ${skippedCount}명`);

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

seedInstructors4();
