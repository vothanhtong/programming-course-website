import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IQuestion {
  questionText: string;
  options: string[];
  correctOptionIndex: number;
  explanation?: string;
}

export interface IQuiz extends Document {
  courseId: Types.ObjectId;
  lessonId?: Types.ObjectId; // Optional: Nếu quiz thuộc về một lesson cụ thể
  title: string;
  description: string;
  questions: IQuestion[];
  passingScore: number; // Phần trăm để qua môn (vd: 80)
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const questionSchema = new Schema<IQuestion>({
  questionText: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctOptionIndex: { type: Number, required: true, min: 0 },
  explanation: { type: String, default: '' },
});

const quizSchema = new Schema<IQuiz>(
  {
    courseId: { type: Schema.Types.ObjectId, ref: 'course', required: true },
    lessonId: { type: Schema.Types.ObjectId, ref: 'lesson' },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    questions: [questionSchema],
    passingScore: { type: Number, default: 80, min: 0, max: 100 },
    isPublished: { type: Boolean, default: false },
  },
  { timestamps: true }
);

quizSchema.index({ courseId: 1, isPublished: 1 });
quizSchema.index({ lessonId: 1 });

export default mongoose.model<IQuiz>('quiz', quizSchema, 'quizzes');
