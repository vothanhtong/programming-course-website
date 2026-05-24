import { Request, Response, NextFunction } from 'express';
import { getStudentId } from '../types';
import { isValidId } from '../utils/validators';
import { progressService } from '../services/progress.service';
import { initializeProgressForEnrollment } from '../services/progress.service';

export { initializeProgressForEnrollment };

// ── STUDENT: Lấy khóa học đã đăng ký (My Courses) ──────
export const getMyEnrolledCourses = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const studentId = getStudentId(req) as string | undefined;
    if (!studentId || !isValidId(studentId)) {
      res.status(401).json({ message: 'Chưa đăng nhập' }); return;
    }

    const result = await progressService.getMyEnrolledCourses(studentId);
    res.json(result);
  } catch (err) { next(err); }
};

// ── STUDENT: Lấy tiến độ chi tiết khóa học ──────
export const getCourseProgress = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const studentId = getStudentId(req) as string | undefined;
    const { courseId } = req.params;

    if (!studentId || !isValidId(studentId)) {
      res.status(401).json({ message: 'Chưa đăng nhập' }); return;
    }
    if (!isValidId(courseId)) {
      res.status(400).json({ message: 'Course ID không hợp lệ' }); return;
    }

    const result = await progressService.getCourseProgress(studentId, courseId);
    res.json(result);
  } catch (err) { next(err); }
};

// ── STUDENT: Cập nhật tiến độ bài học (mark as complete) ──────
export const updateLessonProgress = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const studentId = getStudentId(req) as string | undefined;
    const { courseId, lessonId } = req.params;

    if (!studentId || !isValidId(studentId)) {
      res.status(401).json({ message: 'Chưa đăng nhập' }); return;
    }
    if (!isValidId(courseId) || !isValidId(lessonId)) {
      res.status(400).json({ message: 'ID không hợp lệ' }); return;
    }

    const progress = await progressService.updateLessonProgress(studentId, courseId, lessonId, req.body);
    res.json({ message: 'Cập nhật tiến độ thành công', progress });
  } catch (err) { next(err); }
};

// ── STUDENT: Lấy dashboard thống kê học tập ──────
export const getStudentLearningStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const studentId = getStudentId(req) as string | undefined;
    if (!studentId || !isValidId(studentId)) {
      res.status(401).json({ message: 'Chưa đăng nhập' }); return;
    }

    const result = await progressService.getStudentLearningStats(studentId);
    res.json(result);
  } catch (err) { next(err); }
};

// ── ADMIN: Lấy tiến độ học viên trong khóa ──────
export const adminGetStudentProgress = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { courseId } = req.params;
    if (!isValidId(courseId)) {
      res.status(400).json({ message: 'Course ID không hợp lệ' }); return;
    }

    const result = await progressService.adminGetStudentProgress(courseId, req.query);
    res.json(result);
  } catch (err) { next(err); }
};
