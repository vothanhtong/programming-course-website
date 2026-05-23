import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IQuizResult extends Document {
  studentId: Types.ObjectId;
  quizId: Types.ObjectId;
  score: number;       // e.g. 80.5
  totalQuestions: number;
  correctAnswers: number;
  passed: boolean;
  answers: number[];   // Index of options the student chose
  createdAt: Date;
  updatedAt: Date;
}

const quizResultSchema = new Schema<IQuizResult>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'student', required: true },
    quizId: { type: Schema.Types.ObjectId, ref: 'quiz', required: true },
    score: { type: Number, required: true },
    totalQuestions: { type: Number, required: true },
    correctAnswers: { type: Number, required: true },
    passed: { type: Boolean, required: true },
    answers: [{ type: Number, required: true }],
  },
  { timestamps: true }
);

// Một student có thể làm 1 quiz nhiều lần, nhưng index này giúp query lịch sử nhanh
quizResultSchema.index({ studentId: 1, quizId: 1 });

export default mongoose.model<IQuizResult>('quizResult', quizResultSchema, 'quiz_results');
