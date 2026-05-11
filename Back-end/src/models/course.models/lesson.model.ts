import mongoose, { Document, Schema, Types } from 'mongoose';

interface IResource {
  name?: string;
  url?: string;
  type?: 'pdf' | 'zip' | 'link' | 'other';
}

export interface ILesson extends Document {
  courseId: Types.ObjectId;
  title: string;
  description: string;
  videoUrl: string;
  duration: number;
  order: number;
  isFree: boolean;
  isPublished: boolean;
  resources: IResource[];
}

const lessonSchema = new Schema<ILesson>(
  {
    courseId:    { type: Schema.Types.ObjectId, ref: 'course', required: true },
    title:       { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    videoUrl:    { type: String, default: '' },
    duration:    { type: Number, default: 0, min: 0 },
    order:       { type: Number, required: true, min: 1 },
    isFree:      { type: Boolean, default: false },
    isPublished: { type: Boolean, default: false },
    resources: [
      {
        name: String,
        url:  String,
        type: { type: String, enum: ['pdf', 'zip', 'link', 'other'] },
      },
    ],
  },
  { timestamps: true }
);

lessonSchema.index({ courseId: 1, order: 1 });

export default mongoose.model<ILesson>('lesson', lessonSchema, 'lessons');
