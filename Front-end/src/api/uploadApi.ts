import axiosClient from './axiosClient';

const uploadApi = {
  // Admin: Upload course image
  uploadCourseImage: (file: File): Promise<{ url: string; filename: string }> => {
    const formData = new FormData();
    formData.append('image', file);
    return axiosClient.post('/apis/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // Admin: Delete uploaded image
  deleteImage: (filename: string): Promise<{ message: string }> =>
    axiosClient.delete(`/apis/upload/image/${filename}`),

  // Student: Upload avatar
  uploadStudentAvatar: (file: File): Promise<{ url: string; message: string }> => {
    const formData = new FormData();
    formData.append('avatar', file);
    return axiosClient.post('/apis/upload/student-avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // Admin: Upload avatar
  uploadAdminAvatar: (file: File): Promise<{ url: string; message: string }> => {
    const formData = new FormData();
    formData.append('avatar', file);
    return axiosClient.post('/apis/upload/admin-avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export default uploadApi;
