import mongoose, { Document, Schema } from 'mongoose';

export interface IDetailSection {
  title: string;
  items: string[];
}

export interface IInstructor extends Document {
  name: string;
  position: string;
  education: string;
  category: 'leader' | 'acting' | 'musical' | 'dance';
  profileImages: string[];
  detailSections: IDetailSection[];
  viewCount: number;
  order: number;
  isActive: boolean;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const DetailSectionSchema = new Schema<IDetailSection>(
  {
    title: {
      type: String,
      required: true,
    },
    items: [{
      type: String,
    }],
  },
  { _id: false }
);

const InstructorSchema = new Schema<IInstructor>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    position: {
      type: String,
      required: true,
      trim: true,
    },
    education: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ['leader', 'acting', 'musical', 'dance'],
      required: true,
    },
    profileImages: [{
      type: String,
    }],
    detailSections: [DetailSectionSchema],
    viewCount: {
      type: Number,
      default: 0,
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// 소프트 삭제된 문서 제외 (기본 쿼리)
InstructorSchema.pre('find', function () {
  this.where({ isDeleted: false });
});

InstructorSchema.pre('findOne', function () {
  this.where({ isDeleted: false });
});

InstructorSchema.pre('countDocuments', function () {
  this.where({ isDeleted: false });
});

// 인덱스 설정
InstructorSchema.index({ category: 1, order: 1 });
InstructorSchema.index({ name: 'text' });
InstructorSchema.index({ isActive: 1 });

const Instructor = mongoose.model<IInstructor>('Instructor', InstructorSchema);

export default Instructor;
