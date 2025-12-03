import mongoose, { Document, Schema } from 'mongoose';

export interface IComment {
  _id?: mongoose.Types.ObjectId;
  author: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IConsultation extends Document {
  writerId: string;
  password: string;
  title: string;
  content: string;
  boardType: 'INQUIRY' | 'CONSULTATION';
  isSecret: boolean;
  status: 'PENDING' | 'ANSWERED';
  viewCount: number;
  comments: IComment[];
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema = new Schema<IComment>(
  {
    author: {
      type: String,
      required: true,
      default: '관리자',
    },
    content: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const ConsultationSchema = new Schema<IConsultation>(
  {
    writerId: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    password: {
      type: String,
      required: function(this: IConsultation) { return this.isSecret; },
    },
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
    boardType: {
      type: String,
      enum: ['INQUIRY', 'CONSULTATION'],
      default: 'INQUIRY',
    },
    isSecret: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['PENDING', 'ANSWERED'],
      default: 'PENDING',
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    comments: [CommentSchema],
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
ConsultationSchema.pre('find', function () {
  this.where({ isDeleted: false });
});

ConsultationSchema.pre('findOne', function () {
  this.where({ isDeleted: false });
});

ConsultationSchema.pre('countDocuments', function () {
  this.where({ isDeleted: false });
});

// 인덱스 설정
ConsultationSchema.index({ boardType: 1, createdAt: -1 });
ConsultationSchema.index({ title: 'text', content: 'text' });

const Consultation = mongoose.model<IConsultation>('Consultation', ConsultationSchema);

export default Consultation;
