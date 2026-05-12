import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IAdmin extends Document {
  userName: string;
  password: string;
  email: string;
  fullName: string;
  age?: number;
  phone?: string;
  avatar?: string;
  fb?: string;
  address?: string;
  comparePassword(plain: string): Promise<boolean>;
}

const adminSchema = new Schema<IAdmin>({
  userName: { type: String, unique: true, required: true, trim: true },
  password: { type: String, required: true },
  email:    { type: String, required: true, unique: true, trim: true, lowercase: true },
  fullName: { type: String, required: true, trim: true },
  age:      Number,
  phone:    { type: String, default: '' },
  avatar:   { type: String, default: '' },
  fb:       { type: String, default: '' },
  address:  { type: String, default: '' },
}, { timestamps: true });

// Hash password trước khi lưu (giống student model)
adminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

adminSchema.methods.comparePassword = function (plain: string): Promise<boolean> {
  return bcrypt.compare(plain, this.password);
};

export default mongoose.model<IAdmin>('admin', adminSchema, 'admins');
