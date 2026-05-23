import axiosClient from './axiosClient';

const quizApi = {
  getCourseQuizzes: (courseId: string): Promise<{ quizzes: any[] }> =>
    axiosClient.get(`/apis/quizzes/course/${courseId}`),

  getQuizHistory: (courseId: string): Promise<{ history: any[] }> =>
    axiosClient.get('/apis/quizzes/history', { params: { courseId } }),

  getQuizDetail: (quizId: string): Promise<{ quiz: any }> =>
    axiosClient.get(`/apis/quizzes/${quizId}`),

  submitQuiz: (quizId: string, answers: number[]): Promise<{ message: string; result: any; quizReview: any }> =>
    axiosClient.post(`/apis/quizzes/${quizId}/submit`, { answers }),
};

export default quizApi;
