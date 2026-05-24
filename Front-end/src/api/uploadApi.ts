import axiosClient from './axiosClient';
import { API_ROUTES } from '../constants/apiRoutes';

const uploadApi = {
  uploadImage: (file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append('image', file);
    return axiosClient.post(API_ROUTES.UPLOAD.IMAGE, formData);
  },

  deleteImage: (filename: string): Promise<{ message: string }> =>
    axiosClient.delete(`${API_ROUTES.UPLOAD.IMAGE}/${filename}`),

  uploadStudentAvatar: (file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append('avatar', file);
    return axiosClient.post(API_ROUTES.UPLOAD.STUDENT_AVATAR, formData);
  },

  uploadAdminAvatar: (file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append('avatar', file);
    return axiosClient.post(API_ROUTES.UPLOAD.ADMIN_AVATAR, formData);
  }
};

export default uploadApi;
