import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage extends Document {
  name: string;
  email: string;
  phone: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    name:    { type: String, required: true, trim: true, maxlength: 100 },
    email:   { type: String, required: true, trim: true, lowercase: true },
    phone:   { type: String, default: '', trim: true, maxlength: 20 },
    message: { type: String, required: true, trim: true, maxlength: 2000 },
    isRead:  { type: Boolean, default: false },
  },
  { timestamps: true }
);

messageSchema.index({ isRead: 1, createdAt: -1 });

export default mongoose.model<IMessage>('message', messageSchema, 'messages');
