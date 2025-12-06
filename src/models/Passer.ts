import mongoose, { Document, Schema } from 'mongoose';

export interface IPasser extends Document {
  title: string;
  thumbnailUrl: string;
  imageUrls: string[];
  viewCount: number;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PasserSchema = new Schema<IPasser>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    thumbnailUrl: {
      type: String,
      required: true,
    },
    imageUrls: {
      type: [String],
      default: [],
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
PasserSchema.pre('find', function () {
  this.where({ isDeleted: false });
});

PasserSchema.pre('findOne', function () {
  this.where({ isDeleted: false });
});

PasserSchema.pre('countDocuments', function () {
  this.where({ isDeleted: false });
});

// 인덱스 설정
PasserSchema.index({ createdAt: -1 });
PasserSchema.index({ title: 'text' });

const Passer = mongoose.model<IPasser>('Passer', PasserSchema);

export default Passer;
