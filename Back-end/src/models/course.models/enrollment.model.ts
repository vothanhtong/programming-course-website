import mongoose, { Document, Schema, Types } from 'mongoose';
import type { PaymentStatus, PaymentMethod } from '../../types';

export interface IEnrollment extends Document {
  courseId: Types.ObjectId;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  amount: number;
  note: string;
  createdAt: Date;
}

const enrollmentSchema = new Schema<IEnrollment>(
  {
    courseId:      { type: Schema.Types.ObjectId, ref: 'course', required: true },
    studentName:   { type: String, required: true, trim: true },
    studentEmail:  { type: String, required: true, trim: true, lowercase: true },
    studentPhone:  { type: String, default: '' },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
    paymentMethod: { type: String, enum: ['bank_transfer', 'momo', 'vnpay', 'free', 'granted', 'other'], default: 'other' },
    amount:        { type: Number, default: 0, min: 0 },
    note:          { type: String, default: '' },
  },
  { timestamps: true }
);

enrollmentSchema.index({ courseId: 1 });
enrollmentSchema.index({ studentEmail: 1 });
enrollmentSchema.index({ paymentStatus: 1 });
enrollmentSchema.index({ createdAt: -1 });

export default mongoose.model<IEnrollment>('enrollment', enrollmentSchema, 'enrollments');
