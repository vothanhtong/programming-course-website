import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IStudent extends Document {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  isVerified: boolean;
  verifyToken?: string;
  verifyTokenExpiry?: Date;
  resetToken?: string;
  resetTokenExpiry?: Date;
  enrolledCourses: mongoose.Types.ObjectId[];
  createdAt: Date;
  comparePassword(plain: string): Promise<boolean>;
}

const studentSchema = new Schema<IStudent>(
  {
    fullName:          { type: String, required: true, trim: true },
    email:             { type: String, required: true, unique: true, trim: true, lowercase: true },
    password:          { type: String, required: true, minlength: 6, maxlength: 128 },
    phone:             { type: String, default: '' },
    avatar:            { type: String, default: '' },
    bio:               { type: String, default: '' },
    isVerified:        { type: Boolean, default: false },
    verifyToken:       { type: String, default: null },
    verifyTokenExpiry: { type: Date,   default: null },
    resetToken:        { type: String, default: null },
    resetTokenExpiry:  { type: Date,   default: null },
    enrolledCourses:   [{ type: Schema.Types.ObjectId, ref: 'course' }],
  },
  { timestamps: true }
);

// Hash password trước khi lưu
studentSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

studentSchema.methods.comparePassword = function (plain: string): Promise<boolean> {
  return bcrypt.compare(plain, this.password);
};

export default mongoose.model<IStudent>('student', studentSchema, 'students');
