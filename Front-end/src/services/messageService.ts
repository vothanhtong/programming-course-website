import axiosClient from '../api/axiosClient';
import { API_ROUTES } from '../constants/apiRoutes';

export const messageService = {
  sendMessage(data: { name: string; email: string; phone?: string; message: string }) {
    return axiosClient.post(API_ROUTES.MESSAGES.BASE, data);
  }
};
