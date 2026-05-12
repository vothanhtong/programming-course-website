import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IReview extends Document {
  courseId: Types.ObjectId;
  studentName: string;
  studentAvatar: string;
  rating: number;
  comment: string;
  isApproved: boolean;
  createdAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    courseId:      { type: Schema.Types.ObjectId, ref: 'course', required: true },
    studentName:   { type: String, required: true, trim: true },
    studentAvatar: { type: String, default: '' },
    rating:        { type: Number, required: true, min: 1, max: 5 },
    comment:       { type: String, default: '', maxlength: 1000 },
    isApproved:    { type: Boolean, default: false },
  },
  { timestamps: true }
);

reviewSchema.index({ courseId: 1, isApproved: 1 });
reviewSchema.index({ createdAt: -1 });

export default mongoose.model<IReview>('review', reviewSchema, 'reviews');
