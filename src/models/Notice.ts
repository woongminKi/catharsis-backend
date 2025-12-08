import mongoose, { Document, Schema } from 'mongoose';

export interface INotice extends Document {
  title: string;
  content: string;
  thumbnailUrl?: string;
  viewCount: number;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const NoticeSchema = new Schema<INotice>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    content: {
      type: String,
      required: true,
    },
    thumbnailUrl: {
      type: String,
      default: '',
    },
    viewCount: {
      type: Number,
      default: 0,
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
NoticeSchema.pre('find', function () {
  this.where({ isDeleted: false });
});

NoticeSchema.pre('findOne', function () {
  this.where({ isDeleted: false });
});

NoticeSchema.pre('countDocuments', function () {
  this.where({ isDeleted: false });
});

// 인덱스 설정
NoticeSchema.index({ createdAt: -1 });
NoticeSchema.index({ title: 'text' });

const Notice = mongoose.model<INotice>('Notice', NoticeSchema);

export default Notice;
