import mongoose, { Document, Schema } from 'mongoose';

export interface IResource extends Document {
  title: string;
  content: string;
  thumbnailUrl?: string;
  viewCount: number;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ResourceSchema = new Schema<IResource>(
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
ResourceSchema.pre('find', function () {
  this.where({ isDeleted: false });
});

ResourceSchema.pre('findOne', function () {
  this.where({ isDeleted: false });
});

ResourceSchema.pre('countDocuments', function () {
  this.where({ isDeleted: false });
});

// 인덱스 설정
ResourceSchema.index({ createdAt: -1 });
ResourceSchema.index({ title: 'text' });

const Resource = mongoose.model<IResource>('Resource', ResourceSchema);

export default Resource;
