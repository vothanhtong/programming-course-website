import mongoose from 'mongoose';
import AdminModel from './src/models/account.models/admin.model';
import dotenv from 'dotenv';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI as string).then(async () => {
  const admin = await AdminModel.findOne({ userName: 'admin' });
  console.log('Admin found:', admin ? 'Yes' : 'No');
  if (admin) {
    const isMatch = await admin.comparePassword('Admin@123');
    console.log('Password match:', isMatch);
    console.log('Admin details:', admin.toObject());
  }
  process.exit(0);
}).catch(console.error);
