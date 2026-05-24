import { Request, Response, NextFunction } from 'express';
import { getStudentId } from '../types';
import { getParam } from '../utils/validators';
import { quizService } from '../services/quiz.service';

// ==========================================
// ADMIN CONTROLLERS
// ==========================================

export const createQuiz = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { courseId, title, questions } = req.body;
    if (!courseId || !title || !questions || questions.length === 0) {
      res.status(400).json({ message: 'courseId, title và ít nhất 1 câu hỏi là bắt buộc' }); return;
    }

    const quiz = await quizService.createQuiz(req.body);
    res.status(201).json({ message: 'Tạo quiz thành công', quiz });
  } catch (err) { next(err); }
};

export const updateQuiz = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = getParam(req.params.id);
    const quiz = await quizService.updateQuiz(id, req.body);
    res.status(200).json({ message: 'Cập nhật thành công', quiz });
  } catch (err) { next(err); }
};

export const deleteQuiz = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = getParam(req.params.id);
    await quizService.deleteQuiz(id);
    res.status(200).json({ message: 'Xóa quiz thành công' });
  } catch (err) { next(err); }
};

export const getAdminQuizzes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await quizService.getAdminQuizzes(req.query);
    res.status(200).json(result);
  } catch (err) { next(err); }
};

// ==========================================
// STUDENT CONTROLLERS
// ==========================================

export const getCourseQuizzes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const courseId = getParam(req.params.courseId);
    const result = await quizService.getCourseQuizzes(courseId);
    res.status(200).json(result);
  } catch (err) { next(err); }
};

export const getQuizForStudent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = getParam(req.params.id);
    const result = await quizService.getQuizForStudent(id);
    res.status(200).json(result);
  } catch (err) { next(err); }
};

export const submitQuiz = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const studentId = getStudentId(req);
    const { answers } = req.body;

    if (!studentId) { res.status(401).json({ message: 'Chưa đăng nhập' }); return; }
    if (!Array.isArray(answers)) { res.status(400).json({ message: 'answers phải là một mảng các lựa chọn' }); return; }

    const id = getParam(req.params.id);
    const result = await quizService.submitQuiz(id, studentId, answers);
    res.status(200).json({
      message: 'Nộp bài thành công',
      ...result
    });
  } catch (err) { next(err); }
};

export const getStudentQuizHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const studentId = getStudentId(req);
    if (!studentId) { res.status(401).json({ message: 'Chưa đăng nhập' }); return; }

    const result = await quizService.getStudentQuizHistory(studentId, req.query);
    res.status(200).json(result);
  } catch (err) { next(err); }
};
