import mongoose, { Document, Schema } from 'mongoose';

export interface IGallery extends Document {
  title: string;
  imageUrl: string;
  viewCount: number;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const GallerySchema = new Schema<IGallery>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    imageUrl: {
      type: String,
      required: true,
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
GallerySchema.pre('find', function () {
  this.where({ isDeleted: false });
});

GallerySchema.pre('findOne', function () {
  this.where({ isDeleted: false });
});

GallerySchema.pre('countDocuments', function () {
  this.where({ isDeleted: false });
});

// 인덱스 설정
GallerySchema.index({ createdAt: -1 });
GallerySchema.index({ title: 'text' });

const Gallery = mongoose.model<IGallery>('Gallery', GallerySchema);

export default Gallery;
