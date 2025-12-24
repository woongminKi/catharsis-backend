import mongoose, { Document, Schema } from 'mongoose';

// 메인 히어로 섹션
export interface IHeroSection {
  imageUrls: string[];
  subtitle: string;
  title: string;
  buttonText: string;
  buttonLink: string;
}

// 학교별 합격자
export interface ISchoolPasser {
  thumbnailUrl: string;
  school: string;
  count: number;
  link: string;
  order: number;
}

// 유튜브 영상
export interface IYoutubeVideo {
  thumbnailUrl: string;
  title: string;
  description: string;
  link: string;
  order: number;
}

// 강사진
export interface IInstructor {
  imageUrl: string;
  name: string;
  description: string;
  link: string;
  order: number;
}

// 인스타그램 포스트
export interface IInstagramPost {
  imageUrl: string;
  title: string;
  link: string;
  order: number;
}

// 역대 합격자
export interface IHistoryPasser {
  leftText: string;   // 학교 연도 (예: "한국예술종합학교 25학년도")
  rightText: string;  // 이름 (예: "이찬민")
  order: number;
}

export interface IContent extends Document {
  heroSection: IHeroSection;
  schoolPassers: ISchoolPasser[];
  youtubeVideos: IYoutubeVideo[];
  instructors: IInstructor[];
  instagramPosts: IInstagramPost[];
  historyPassers: IHistoryPasser[];
  updatedAt: Date;
}

const HeroSectionSchema = new Schema<IHeroSection>({
  imageUrls: { type: [String], default: [] },
  subtitle: { type: String, default: 'MAKE YOUR STYLE' },
  title: { type: String, default: '입시를 스타일하다, 민액터스' },
  buttonText: { type: String, default: '2024 합격자 전체보기' },
  buttonLink: { type: String, default: '/passers' },
}, { _id: false });

const SchoolPasserSchema = new Schema<ISchoolPasser>({
  thumbnailUrl: { type: String, default: '' },
  school: { type: String, required: true },
  count: { type: Number, default: 0 },
  link: { type: String, default: '' },
  order: { type: Number, default: 0 },
}, { _id: true });

const YoutubeVideoSchema = new Schema<IYoutubeVideo>({
  thumbnailUrl: { type: String, default: '' },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  link: { type: String, default: '' },
  order: { type: Number, default: 0 },
}, { _id: true });

const InstructorSchema = new Schema<IInstructor>({
  imageUrl: { type: String, default: '' },
  name: { type: String, required: true },
  description: { type: String, default: '' },
  link: { type: String, default: '' },
  order: { type: Number, default: 0 },
}, { _id: true });

const InstagramPostSchema = new Schema<IInstagramPost>({
  imageUrl: { type: String, default: '' },
  title: { type: String, default: '' },
  link: { type: String, default: '' },
  order: { type: Number, default: 0 },
}, { _id: true });

const HistoryPasserSchema = new Schema<IHistoryPasser>({
  leftText: { type: String, required: true },
  rightText: { type: String, required: true },
  order: { type: Number, default: 0 },
}, { _id: true });

const ContentSchema = new Schema<IContent>(
  {
    heroSection: { type: HeroSectionSchema, default: () => ({}) },
    schoolPassers: { type: [SchoolPasserSchema], default: [] },
    youtubeVideos: { type: [YoutubeVideoSchema], default: [] },
    instructors: { type: [InstructorSchema], default: [] },
    instagramPosts: { type: [InstagramPostSchema], default: [] },
    historyPassers: { type: [HistoryPasserSchema], default: [] },
  },
  {
    timestamps: true,
  }
);

const Content = mongoose.model<IContent>('Content', ContentSchema);

export default Content;
