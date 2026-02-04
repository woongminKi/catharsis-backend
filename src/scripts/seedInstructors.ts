import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from '../config/database';
import Instructor from '../models/Instructor';

const instructorsData = [
  // === Leader (대표/원장) ===
  {
    name: '김동길',
    position: '대표원장',
    education: '중앙대학교 연극학과 연기전공',
    category: 'leader' as const,
    profileImages: [],
    order: 1,
    isActive: true,
    detailSections: [
      {
        title: '원장 김동길',
        items: [],
      },
      {
        title: '학력',
        items: ['중앙대학교 연극학과 졸업'],
      },
      {
        title: '레슨경력',
        items: [
          '前 에이스 연기학원',
          '前 좋은사이 연기학원',
          '前 이엔티 연기학원',
          '前 kcp연기학원 원장',
          '前 짓 액팅스튜디오 원장',
          '前 한림예술고등학교 연예과 출강',
          '現 카타르시스 연기학원 원장 외 개인레슨 다수',
        ],
      },
      {
        title: '연극',
        items: [
          '2011 내남자의 혈액형 -주연',
          '2010 코끼리에 관한 오해 -주연',
          '2008 돌아봐 ! 오 잔예자아! -주연',
          '2008 후연해 오베후나 -조연',
          '2006 공중으로 날다 -주연',
        ],
      },
      {
        title: '영화',
        items: [
          '2014 10분 이용승감독님 - 조연',
          '2013 금지된장난(독립장편) 해환감독님 - 주연',
          '2013 자연선택설(독립단편) 박지현감독님 - 주연',
          '2012 스타:빛나는사랑(상업장편) 한상희감독님 - 조연',
          '2012 흑점 (부천영화제-단편) 김성훈감독님 -주연',
          '2012 저스트 프렌즈(상업장편) 안철호감독님 - 조연',
          '2011 "영화 한국을 만나다"- 초대 김인식감독님 - 조연',
          '2011 탱고 (독립장편) 하재봉감독님 - 조연',
          '2010 Color zoo (독립장편) 은오감독님 - 주연',
          '2008 굿바이 도날드 (미장센-단편) 김인영감독님 - 주연',
        ],
      },
      {
        title: '드라마',
        items: [
          '2014 SBS 기분좋은날 - 은우 역',
          '2013 KBS 굿닥터 - 윤재영 역',
          'JTBC 청담동 살아요 - 철민역',
          'MBC 애정만만세 - 상민역',
        ],
      },
    ],
  },
  {
    name: '이호협',
    position: '대표원장',
    education: '중앙대학교 연극학과 연기전공',
    category: 'leader' as const,
    profileImages: [],
    order: 2,
    isActive: true,
    detailSections: [
      {
        title: '학력',
        items: [
          '안양예술고등학교 연극영화과 졸업',
          '중앙대학교 연극학과 졸업',
        ],
      },
      {
        title: '레슨경력',
        items: [
          '前 좋은사이 연기학원 전임강사',
          '前 학동식구들 연기학원 팀장',
          '前 짓 액팅스튜디오 원장',
          '現 카타르시스 연기학원 원장 외 개인레슨 다수',
        ],
      },
      {
        title: '연극',
        items: [
          '2014 연극 햄릿- 햄릿 역 (예술의전당 자유소극장)',
          '2014 연극 리처드2세 -오멜 역 (국립극단)',
          '2013 연극 로미오와 줄리엣- 로미오 역 (국립극단)',
          '2013 연극 해변의 카프카- 카프카 역 (동숭아트센터 동숭홀)',
          '2010 연극 영국왕 엘리자베스- 네드 역 (설치극장 정미소) 외 다수',
        ],
      },
      {
        title: '수상',
        items: ['2015 제 4회 셰익스피어 어워즈 연기상 수상'],
      },
      {
        title: '영화',
        items: [
          '2012 <설해>',
          '2012 <신입사원>',
          '2012 <피노키오 실종사건>',
          '2011 <통통한 혁명>',
          '2010 <쩍>',
          '2010 <레인보우>',
          '2004 <면도를 하다> 외 독립, 단편 다수',
        ],
      },
      {
        title: '드라마',
        items: [
          '2016 TVN <치즈인더트랩> - 재범 역',
          '2012 SBS <청담동 앨리스>',
          '2012 KBS <냉쿨쩌 끌러온 당신>',
        ],
      },
    ],
  },
  {
    name: '유현도',
    position: '홍대점 대표원장',
    education: '중앙대학교 연극학과 연기전공',
    category: 'leader' as const,
    profileImages: [],
    order: 3,
    isActive: true,
    detailSections: [
      {
        title: '학력',
        items: [
          '중앙대학교 연극학과 졸업',
          'UT(University Of Texas At Austin) 교환학생',
        ],
      },
      {
        title: '수상',
        items: ['백석대학교 뮤지컬콘테스트 우수 지도자상'],
      },
      {
        title: '레슨경력',
        items: [
          '現 카타르시스 연기학원 전임 강사',
          '짓 액팅 스튜디오 연기강사',
          '113acting studio 임시총괄 강사',
          '개인레슨 다수',
        ],
      },
      {
        title: '연극',
        items: [
          "2010 '보석과 여인' 남자 역",
          "2011 'LEAR' 에드먼드 역",
          "2012 '타오르는 어둠 속에서' 이그나시오 역",
          "2013 'ART' 규태 역",
          "2013 '곰' 젊은 사육사 역",
          "2013 '청혼' 아버지 역",
          "2013 '당신의 모든 슬픔' 남자2 역",
          "2016 'Ugly man' 최남우 역",
          "2018 '다 아는데 너만 모르는 이야기' 남자2 역",
        ],
      },
      {
        title: '영화',
        items: [
          "2018 단편 '마이 피스타치오' - 연극주연남 역",
          "2016 단편 '그런 줄 알았는데..' - 정현 역",
          "2013 단편 '좋아해서 그랬어' - 정훈 역",
          "2012 단편 '나는 당신의 프랑스' - 바리스타 역",
        ],
      },
      {
        title: '광고',
        items: [
          '2018 환경부 공익광고 닥터 스트레인지 역',
          "2018 롯데몰 김포공항점 '가을남자 편'",
          "2018 롯데몰 은평점 '2주년 편'",
        ],
      },
    ],
  },

  // === Acting (액팅파트) ===
  {
    name: '장서아',
    position: '액팅파트 책임원장',
    education: '중앙대학교 연극학과 연기전공',
    category: 'acting' as const,
    profileImages: [],
    order: 1,
    isActive: true,
    detailSections: [
      {
        title: '학력',
        items: [
          '중앙대학교 일반대학원 공연예술학과 연기전공 석사과정',
          '중앙대학교 연극학과 학부조교',
          '중앙대학교 연극학과 졸업',
          '안양예술고등학교 연극영화과 졸업',
        ],
      },
      {
        title: '레슨경력',
        items: [
          '現 카타르시스 연기학원 전임 강사',
          '7아트픽 전임강사',
          'KS트레이닝센터 전임강사',
          'SG연기아카데미 강사',
          'j&k 엔터테이먼트, 113acting studio, The Little Actors 강사',
          '개인레슨 다수',
        ],
      },
      {
        title: '연극',
        items: [
          '2015 고아뮤즈들 - 이자벨 역',
          '2014 time to tea - 오디션소녀 역 외',
          '2013 토끼와포수 - 미영 역',
          '2013 이디푸스와의 여행 - 목동 역 외',
          '2013 아빠들의 소꿉놀이 - 파마 역',
          '2012 Almost, Maine - ginnet, gayle 역',
        ],
      },
      {
        title: '영화',
        items: [
          '1999. 텀버린맨 - 동생 역',
          '2000. 솜사탕 - 단비 역',
          '2011. 임팩트 - 연구원 역',
          '2012. 장준환을 기다리며 - 미현 역(올레 스마트폰 영화제 출품작)',
          '2012. 유언 - 지현 역',
          '2012. 사랑은 연필로 쓰세요 - 윤희진 역',
          '2013. 주미 - 재희 역 외 다수',
        ],
      },
      {
        title: '자격증',
        items: ['스피치지도사 1급'],
      },
    ],
  },
  {
    name: '박찬진',
    position: '액팅파트 교육원장',
    education: '세종대학교 영화예술학과 연기예술전공',
    category: 'acting' as const,
    profileImages: [],
    order: 2,
    isActive: true,
    detailSections: [
      {
        title: '학력',
        items: [
          '안양예술고등학교 연극영화과 졸업',
          '세종대학교 영화예술학과 연기예술전공 졸업',
          '세종대학교 일반대학원 영화예술학과 수료',
        ],
      },
      {
        title: '레슨경력',
        items: [
          '前 한국예술고등학교 1학년 제작실습 강사',
          '前 안양예술고등학교 2학년 제작실습 강사',
          '前 주액터스 연기학원 부원장',
          '現 카타르시스 연기학원 외 개인레슨 다수',
        ],
      },
      {
        title: '연극',
        items: [
          '2014 연극 테레즈 라캥 - 로랑 역 (대학로 스타시티 후암 시어터)',
          '2018 연극 여도 - 이성 역 (예술의전당 토월극장)',
          '2019 연극 욕망이라는 이름의 전차 - 스탠리역 (혜화당소극장)',
        ],
      },
      {
        title: '영화',
        items: [
          '2010 <얼어붙은 땅> 주연',
          '제63회 칸 국제영화제 시네파운데이션 진출',
          '제11회 전주국제영화제 한국단편경쟁 최우수작품상',
          '제6회 대한민국 대학영화제 대상',
          '인디포럼, 미장센 단편영화제 외 다수 영화제 상영',
          '',
          '2012 <스끼다시 내 인생> 주연',
          '제 18회 인디포럼 신작전<단편> (2013)',
          '',
          '2013 <동화역> 주연',
          '제5회 프랑스 스트라스부르 한국영화제 단편경쟁 (2013)',
          '',
          '2014 <표정들> 주연',
          '제40회 서울독립영화제 새로운 선택 부문 (2014)',
          '제20회 인디포럼 영화제 월례비평, 신작전<장관> (2015)',
          '',
          '2015 <취중진담> 주연',
          '서울 국제 청소년영화제 경쟁 부문(2016)',
          '',
          '2016 <백패킹> 주연',
          '서울독립영화제 새로운 선택 부문 (2016)',
          '',
          '외 다수 영화 및 웹드라마 작품 출연',
        ],
      },
    ],
  },
  {
    name: '박준혁',
    position: '홍대점 액팅파트 책임원장',
    education: '중앙대학교 연극학과 연기전공',
    category: 'acting' as const,
    profileImages: [],
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
          '現 카타르시스 연기학원 책임원장',
          '짓 액팅 스튜디오 연기 강사',
          '113acting studio 입시 강사',
          '개인레슨 다수',
        ],
      },
      {
        title: '연극',
        items: [
          "2018 <아버지와 살면> '다케조' 역 (홍대 레드빅스페이스)",
          "2020 <아마데우스> '요제프 황제 & 코러스' 역 (압구정 BBCH홀)",
          "2021 <운소도> '김명윤' 역 (후암씨어터)",
          "2022 <저기요..> '김주일' 역 (알과핵 소극장)",
          "2023 <아마데우스> '요제프 황제' 역 (세종문화회관 M씨어터)",
          "2023 <사의 찬미> '김우진' 역 (아트원씨어터 3관)",
        ],
      },
      {
        title: '영화',
        items: [
          "2016년 단편 <아는사람> '소년' 역 (2016 부산국제영화제 선재상)",
          "2016년 단편 <반배치고사> '학생' 역",
          "2020년 단편 <사각형> '범수' 역 (제 10회 서울 국제 프라이드 영화제)",
          "2021년 단편 <더 워크> '학생3' 역 (fondant)",
        ],
      },
    ],
  },
  {
    name: '박선영',
    position: '홍대점 액팅파트 부원장',
    education: '중앙대학교 연극학과 연기전공',
    category: 'acting' as const,
    profileImages: [],
    order: 4,
    isActive: true,
    detailSections: [
      {
        title: '학력',
        items: [
          '안양예술고등학교 연극영화과 졸업',
          '중앙대학교 연극학과 뮤지컬/연기 통합전공 졸업',
        ],
      },
      {
        title: '강사이력',
        items: [
          '前미라클체인지연기학원 입시반 반전임',
          '前미라클체인지연기학원 예비반 특기수업 뮤지컬 강사',
          '前주액터스연기학원 뮤지컬강사',
          '前짓액팅 연기강사',
          '前113Acting Studio 연기강사',
          '카타르시스연기학원 홍대점 부원장',
        ],
      },
      {
        title: '경력사항',
        items: [
          "<Reprise-season9>('waitress'- she used to be mine)",
          '<화장실에서>-선영',
          '<세자매>-올가',
          '<마스크>-수녀',
          '<맥베스 化神, 崩神>- 마녀',
          '<살아있는이중생각하>-우씨부인',
          '<동승>-인수',
          '<레미제라블>-앙상블',
          '<갈매기>-마샤',
          '<벚꽃동산>-샤를로따',
        ],
      },
      {
        title: '단 편 영 화',
        items: [
          '축배를 들어라-수연',
          '푸랑스무제-여자',
          '정관장드라마타이즈-선영 금상수상',
        ],
      },
    ],
  },
  {
    name: '양주원',
    position: '액팅파트 부원장',
    education: '중앙대학교 연극학과 연기전공',
    category: 'acting' as const,
    profileImages: [],
    order: 5,
    isActive: true,
    detailSections: [
      {
        title: '학력',
        items: ['중앙대학교 연극학과 연기전공'],
      },
      {
        title: '학력',
        items: [
          '중앙대학교 일반대학원 공연예술학과(연극) 연기전공 석사 과정',
          '중앙대학교 연극학과 조교',
          '중앙대학교 연극학과 졸업',
        ],
      },
      {
        title: '입시 경력',
        items: [
          '2024- 카타르시스연기학원 입시연기강사',
          '2021-2023 더아이엠연기학원 연기강사',
          '2023 개인레슨 진행',
        ],
      },
      {
        title: '연극',
        items: [
          '2023',
          '2019 (ATEC참가작) <상아성 - 달빛 여인들>',
          '2017 <니부모얼굴이보고싶다>',
          '2017 <시련>',
          '2017 <오해>',
          '2016 <봄의노래는바다에호르고>',
          '2016 <박사>',
        ],
      },
      {
        title: '영화',
        items: [
          "2019 '완벽한 하루' 윤하 역",
          "2018 '자유연기' 김도영 감독 (STAFF - 스크립터)",
          "2017 '소녀여일어나라' 꽃녀 역",
        ],
      },
      {
        title: '드라마',
        items: [
          "2020 웹드라마 '배우 지망생 조연이의 일기 ' 하주원 역",
          "2013 mbc 드라마 스페셜 '아프리카에서 살아남는 법' 장서형 역",
        ],
      },
    ],
  },
  {
    name: '김연수',
    position: '액팅파트',
    education: '중앙대학교 연극학과 연기전공',
    category: 'acting' as const,
    profileImages: [],
    order: 6,
    isActive: true,
    detailSections: [
      {
        title: '학력',
        items: ['중앙대학교 연극학과 연기전공'],
      },
      {
        title: '레슨경력',
        items: [
          '現 카타르시스 연기학원 강사',
          '짓 액팅 스튜디오 연기 강사',
          '113acting studio 입시 강사',
          '개인레슨 외 다수',
        ],
      },
      {
        title: '경력사항',
        items: [
          '연극',
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
  },
  {
    name: '김동일',
    position: '액팅파트 팀장',
    education: '중앙대학교 연극학과 연기전공',
    category: 'acting' as const,
    profileImages: [],
    order: 7,
    isActive: true,
    detailSections: [
      {
        title: '-학력',
        items: ['중앙대학교 연극학과 연기전공'],
      },
      {
        title: '<경력사항>',
        items: [
          '2017 前 배우생각 연기학원 연기강사',
          '2016 죽산고등학교 뮤지컬 연기 지도',
          '개인레슨 다수',
        ],
      },
      {
        title: '<연극>',
        items: [
          '2023 그을린 사랑',
          '2020 세자매',
          '2017 리어왕',
          '2016 날 보러와요',
          '2016 우리읍내',
          '2015 아름다운 사인',
          '2014 푸르른 날에',
        ],
      },
      {
        title: '<뮤지컬>',
        items: [
          '2017 번지점프를 하다',
          '2015 레미제라블',
        ],
      },
    ],
  },
  {
    name: '박성민',
    position: '액팅파트 팀장',
    education: '중앙대학교 연극학과 연기전공',
    category: 'acting' as const,
    profileImages: [],
    order: 8,
    isActive: true,
    detailSections: [
      {
        title: '학력',
        items: ['중앙대학교 연극학과 연기전공'],
      },
      {
        title: '경력사항',
        items: [
          '짓 액팅 스튜디오 연기강사',
          '개인레슨 다수',
        ],
      },
      {
        title: '공연',
        items: [
          '2019 < 봄의노래는 바다에 흐르고 >',
          '2020 < 세자매 >',
          '2022 < 신의 막내딸 아네모네 >',
          '2022 < 아리랑 >',
        ],
      },
      {
        title: '영화',
        items: [
          '2022 < 비밀의 언덕 >',
          '2021 < 캐스팅 >',
          '2019 < 도플갱어 >',
        ],
      },
      {
        title: '드라마',
        items: [
          '2022 TvN < 환혼 >',
          '2022 tvN < 월수금화목토 >',
          '2022 tvN < 조선정신과의사 유세풍 >',
          '2022 SBS < 사내맞선 >',
          '2022 넷플릭스 < 셀러브리티 >',
          '2022 JTBC < 재벌집막내아들 >',
          '2022 MBC < 닥터로이어 >',
          '2019 SBS < 간떨어지는 동거 >',
          '2019 tvN < 스타트업 >...기타 등등',
        ],
      },
    ],
  },
  {
    name: '정윤후',
    position: '홍대점 액팅파트 팀장',
    education: '중앙대학교 연극학과 연기전공',
    category: 'acting' as const,
    profileImages: [],
    order: 9,
    isActive: true,
    detailSections: [
      {
        title: '학력',
        items: ['중앙대학교 연극학과 졸업'],
      },
      {
        title: '레슨경력',
        items: [
          '現 카타르시스 연기학원 팀장',
          '짓 액팅 스튜디오 연기 강사',
          '113acting studio 입시 강사',
          '개인레슨 다수',
        ],
      },
      {
        title: '연극',
        items: [
          '<비둘> 용식 역',
          '<보도지침-낭독회> 송원달 역',
        ],
      },
      {
        title: '영화',
        items: [
          '<생존> 단역',
          '<꼬리잡기> 현욱 역',
          '<꽃집> 도영 역',
        ],
      },
      {
        title: '광고',
        items: [
          '2024 KCC 런닝메이트',
          '2019 중앙대학교 입학처 홍보',
        ],
      },
    ],
  },
  {
    name: '박지우',
    position: '액팅파트 입시전임',
    education: '수원대학교 연기예술과 연기전공',
    category: 'acting' as const,
    profileImages: [],
    order: 10,
    isActive: true,
    detailSections: [
      {
        title: '학력',
        items: ['수원대학교 연기예술과 연기전공 졸업'],
      },
      {
        title: '레슨경력',
        items: [
          '現 카타르시스 연기학원 액팅파트 강사',
          '前 짓 액팅 스튜디오 연기강사',
          '113acting studio 입시강사',
          '개인레슨 다수',
        ],
      },
      {
        title: '연극',
        items: [
          '2017 <12인의 성난 사람들> 4번배심원',
          '2020 <시련> 엘리자베스',
          '2021 <집으로> 판카',
          '2021 <라티스베> 레지넬라',
          '2022<레미제라블> 앙상블',
          '2024 <파란나라> 이창현',
        ],
      },
      {
        title: '단편영화',
        items: [
          '2019 <처음처럼> 채윤',
          '2019 <해부극장> 여자1',
          '2020 <홍콩> 전여자친구',
          '2023 <직면> 아파트여자',
        ],
      },
      {
        title: '자격증',
        items: ['중등학교 정교사 2급'],
      },
    ],
  },

  // === Musical (뮤지컬파트) ===
  {
    name: '임혜란',
    position: '뮤지컬파트',
    education: '중앙대학교 연극학과 뮤지컬전공',
    category: 'musical' as const,
    profileImages: [],
    order: 1,
    isActive: true,
    detailSections: [
      {
        title: '학력',
        items: ['중앙대학교 연극학과 졸업'],
      },
      {
        title: '경력',
        items: [
          '전 엑터스 연기학원 뮤지컬 강사',
          '전 3s연기학원 연기강사',
          '',
          '현 카타르시스 연기학원 뮤지컬강사',
          '현 운중고등학교 뮤지컬강사',
          '현 동작고등학교 뮤지컬강사',
          '현 극단 간다 소속',
          '합격생 ㅣ 한예종 ,명지대 뮤지컬과 ,세종대 ,명지전문대, 호원대 한양대 등등',
        ],
      },
      {
        title: '뮤지컬 경력',
        items: [
          '허준',
          '겨울공주 평강이야기',
          '쿵짝1920',
          '이상한 나라의 아빠',
        ],
      },
      {
        title: '연극 경력',
        items: [
          '곰스크로 가는기차',
          '올모스트 메인',
          '오구',
        ],
      },
    ],
  },
  {
    name: '강세화',
    position: '뮤지컬파트',
    education: '서경대학교 뮤지컬학과',
    category: 'musical' as const,
    profileImages: [],
    order: 2,
    isActive: true,
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
          '통엑터스 연기학원 뮤지컬강사',
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
  },

  // === Dance (움직임파트) ===
  {
    name: '한지원',
    position: '홍대점 움직임파트',
    education: '한국예술종합학교 무용과',
    category: 'dance' as const,
    profileImages: [],
    order: 1,
    isActive: true,
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
];

async function seedInstructors() {
  try {
    await connectDB();
    console.log('MongoDB 연결 성공');

    // 기존 데이터 확인
    const existingCount = await Instructor.countDocuments();
    console.log(`기존 강사 수: ${existingCount}`);

    if (existingCount > 0) {
      const readline = require('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      const answer = await new Promise<string>((resolve) => {
        rl.question('기존 데이터가 있습니다. 모두 삭제하고 새로 추가할까요? (y/n): ', resolve);
      });
      rl.close();

      if (answer.toLowerCase() === 'y') {
        await Instructor.deleteMany({});
        console.log('기존 데이터 삭제 완료');
      } else {
        console.log('시드 작업 취소');
        process.exit(0);
      }
    }

    // 새 데이터 삽입
    const result = await Instructor.insertMany(instructorsData);
    console.log(`${result.length}명의 강사 데이터 추가 완료`);

    // 카테고리별 통계
    const stats = await Instructor.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);
    console.log('\n카테고리별 통계:');
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

seedInstructors();
