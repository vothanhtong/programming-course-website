import mongoose, { Document, Schema } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  slug: string;
  description: string;
  icon: string;
  isActive: boolean;
}

const categorySchema = new Schema<ICategory>(
  {
    name:        { type: String, required: true, trim: true, unique: true },
    slug:        { type: String, required: true, trim: true, unique: true, lowercase: true },
    description: { type: String, default: '' },
    icon:        { type: String, default: '' },
    isActive:    { type: Boolean, default: true },
  },
  { timestamps: true }
);

categorySchema.index({ isActive: 1 });

export default mongoose.model<ICategory>('category', categorySchema, 'categories');
