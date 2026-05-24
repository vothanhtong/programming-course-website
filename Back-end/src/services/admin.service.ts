import AdminModel from '../models/account.models/admin.model';
import { signAdminToken } from '../config/jwt.config';

export const adminService = {
  async login(data: any) {
    const adminUser = await AdminModel.findOne({ userName: data.userName });
    if (!adminUser) {
      const err: any = new Error('Tài khoản hoặc mật khẩu không đúng');
      err.status = 401;
      throw err;
    }

    const isMatch = await adminUser.comparePassword(data.password);
    if (!isMatch) {
      const err: any = new Error('Tài khoản hoặc mật khẩu không đúng');
      err.status = 401;
      throw err;
    }

    const token = signAdminToken(adminUser._id.toString());
    return {
      token,
      admin: {
        id: adminUser._id,
        userName: adminUser.userName,
        fullName: adminUser.fullName,
        email: adminUser.email,
        phone: adminUser.phone,
        avatar: adminUser.avatar,
        fb: adminUser.fb,
      }
    };
  },

  async getAdminProfile(adminId: string) {
    const admin = await AdminModel.findById(adminId).select('-password');
    if (!admin) {
      const err: any = new Error('Không tìm thấy admin');
      err.status = 404;
      throw err;
    }
    return admin;
  },

  async updateAdminProfile(adminId: string, updateData: any) {
    const admin = await AdminModel.findByIdAndUpdate(adminId, updateData, { new: true }).select('-password');
    if (!admin) {
      const err: any = new Error('Không tìm thấy admin');
      err.status = 404;
      throw err;
    }
    return admin;
  },

  async changeAdminPassword(adminId: string, data: any) {
    const admin = await AdminModel.findById(adminId);
    if (!admin) {
      const err: any = new Error('Không tìm thấy admin');
      err.status = 404;
      throw err;
    }

    const isMatch = await admin.comparePassword(data.currentPassword);
    if (!isMatch) {
      const err: any = new Error('Mật khẩu hiện tại không đúng');
      err.status = 401;
      throw err;
    }

    admin.password = data.newPassword;
    await admin.save();
  }
};
