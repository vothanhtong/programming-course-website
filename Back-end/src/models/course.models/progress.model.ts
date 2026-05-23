import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ILessonProgress {
  lessonId: Types.ObjectId;
  completed: boolean;
  watchedSeconds: number;
  totalSeconds: number;
  completedAt?: Date;
}

export interface ICourseProgress extends Document {
  studentId: Types.ObjectId;
  courseId: Types.ObjectId;
  lessonsProgress: ILessonProgress[];
  totalLessons: number;
  completedLessons: number;
  progressPercentage: number;
  certificateId?: Types.ObjectId;
  certificateGeneratedAt?: Date;
  enrolledAt: Date;
  completedAt?: Date;
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const lessonProgressSchema = new Schema<ILessonProgress>({
  lessonId: { type: Schema.Types.ObjectId, ref: 'lesson', required: true },
  completed: { type: Boolean, default: false },
  watchedSeconds: { type: Number, default: 0, min: 0 },
  totalSeconds: { type: Number, default: 0, min: 0 },
  completedAt: { type: Date, default: null },
});

const courseProgressSchema = new Schema<ICourseProgress>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'student', required: true },
    courseId: { type: Schema.Types.ObjectId, ref: 'course', required: true },
    lessonsProgress: [lessonProgressSchema],
    totalLessons: { type: Number, default: 0, min: 0 },
    completedLessons: { type: Number, default: 0, min: 0 },
    progressPercentage: { type: Number, default: 0, min: 0, max: 100 },
    certificateId: { type: Schema.Types.ObjectId, ref: 'certificate', default: null },
    certificateGeneratedAt: { type: Date, default: null },
    enrolledAt: { type: Date, default: () => new Date() },
    completedAt: { type: Date, default: null },
    isCompleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Index cho tìm kiếm nhanh
courseProgressSchema.index({ studentId: 1, courseId: 1 }, { unique: true });
courseProgressSchema.index({ studentId: 1 });
courseProgressSchema.index({ courseId: 1 });
courseProgressSchema.index({ isCompleted: 1, studentId: 1 });

export default mongoose.model<ICourseProgress>(
  'courseProgress',
  courseProgressSchema,
  'courseProgress'
);
