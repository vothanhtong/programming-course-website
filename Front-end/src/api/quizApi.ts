import axiosClient from './axiosClient';
import { API_ROUTES } from '../constants/apiRoutes';

const quizApi = {
  getCourseQuizzes: (courseId: string): Promise<{ quizzes: any[] }> =>
    axiosClient.get(`${API_ROUTES.QUIZZES.COURSE}/${courseId}`),

  getStudentQuizHistory: (courseId?: string): Promise<{ history: any[] }> =>
    axiosClient.get(API_ROUTES.QUIZZES.HISTORY, { params: { courseId } }),

  getQuizForStudent: (quizId: string): Promise<{ quiz: any }> =>
    axiosClient.get(`${API_ROUTES.QUIZZES.BASE}/${quizId}`),

  submitQuiz: (quizId: string, answers: number[]): Promise<any> =>
    axiosClient.post(`${API_ROUTES.QUIZZES.BASE}/${quizId}/submit`, { answers }),
};

export default quizApi;
