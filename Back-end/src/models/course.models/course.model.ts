import mongoose, { Document, Schema, Types } from 'mongoose';

export type CourseLevel = 'beginner' | 'intermediate' | 'advanced';

export interface IInstructor {
  name: string;
  avatar: string;
  bio: string;
}

export interface ICourse extends Document {
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  thumbnail: string;
  previewVideo: string;
  price: number;
  salePrice: number | null;
  category: Types.ObjectId;
  instructor: IInstructor;
  level: CourseLevel;
  language: string;
  requirements: string[];
  outcomes: string[];
  tags: string[];
  totalLessons: number;
  totalDuration: number;
  enrollmentCount: number;
  rating: number;
  ratingCount: number;
  isFeatured: boolean;
  isPublished: boolean;
  isFree: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const courseSchema = new Schema<ICourse>(
  {
    title:            { type: String, required: true, trim: true },
    slug:             { type: String, required: true, trim: true, unique: true, lowercase: true },
    description:      { type: String, default: '' },
    shortDescription: { type: String, default: '' },
    thumbnail:        { type: String, default: '' },
    previewVideo:     { type: String, default: '' },
    price:            { type: Number, required: true, default: 0, min: 0 },
    salePrice:        { type: Number, default: null, min: 0 },
    category:         { type: Schema.Types.ObjectId, ref: 'category', required: true },
    instructor: {
      name:   { type: String, default: 'High Sky Instructor' },
      avatar: { type: String, default: '' },
      bio:    { type: String, default: '' },
    },
    level:           { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
    language:        { type: String, default: 'Tiếng Việt' },
    requirements:    [{ type: String }],
    outcomes:        [{ type: String }],
    tags:            [{ type: String }],
    totalLessons:    { type: Number, default: 0, min: 0 },
    totalDuration:   { type: Number, default: 0, min: 0 },
    enrollmentCount: { type: Number, default: 0, min: 0 },
    rating:          { type: Number, default: 0, min: 0, max: 5 },
    ratingCount:     { type: Number, default: 0, min: 0 },
    isFeatured:      { type: Boolean, default: false },
    isPublished:     { type: Boolean, default: false },
    isFree:          { type: Boolean, default: false },
  },
  { timestamps: true }
);

courseSchema.index({ category: 1, isPublished: 1 });
courseSchema.index({ isFeatured: 1, isPublished: 1 });
courseSchema.index({ tags: 1 });
courseSchema.index({ title: 'text' });

export default mongoose.model<ICourse>('course', courseSchema, 'courses');
