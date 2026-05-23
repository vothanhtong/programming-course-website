import { Request, Response } from 'express';
import mongoose from 'mongoose';
import QuizModel from '../models/course.models/quiz.model';
import QuizResultModel from '../models/course.models/quizResult.model';
import CourseModel from '../models/course.models/course.model';
import { getStudentId } from '../types';
import logger from '../configs/logger';

// ==========================================
// ADMIN CONTROLLERS
// ==========================================

export const createQuiz = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { courseId, title, description, questions, passingScore, isPublished, lessonId } = req.body;
    if (!courseId || !title || !questions || questions.length === 0) {
      return res.status(400).json({ message: 'courseId, title và ít nhất 1 câu hỏi là bắt buộc' });
    }

    const newQuiz = new QuizModel({
      courseId,
      title,
      description,
      questions,
      passingScore,
      isPublished,
      lessonId: lessonId || undefined
    });

    await newQuiz.save();
    return res.status(201).json({ message: 'Tạo quiz thành công', quiz: newQuiz });
  } catch (err: any) {
    logger.error(`[createQuiz] ${err.message}`);
    return res.status(500).json({ message: 'Lỗi server' });
  }
};

export const updateQuiz = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedQuiz = await QuizModel.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedQuiz) {
      return res.status(404).json({ message: 'Không tìm thấy quiz' });
    }

    return res.status(200).json({ message: 'Cập nhật thành công', quiz: updatedQuiz });
  } catch (err: any) {
    logger.error(`[updateQuiz] ${err.message}`);
    return res.status(500).json({ message: 'Lỗi server' });
  }
};

export const deleteQuiz = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const deleted = await QuizModel.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: 'Không tìm thấy quiz' });
    }
    // Delete related results
    await QuizResultModel.deleteMany({ quizId: id });

    return res.status(200).json({ message: 'Xóa quiz thành công' });
  } catch (err: any) {
    logger.error(`[deleteQuiz] ${err.message}`);
    return res.status(500).json({ message: 'Lỗi server' });
  }
};

export const getAdminQuizzes = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { courseId } = req.query;
    const filter = courseId ? { courseId } : {};
    const quizzes = await QuizModel.find(filter).sort({ createdAt: -1 });
    return res.status(200).json({ quizzes });
  } catch (err: any) {
    logger.error(`[getAdminQuizzes] ${err.message}`);
    return res.status(500).json({ message: 'Lỗi server' });
  }
};


// ==========================================
// STUDENT CONTROLLERS
// ==========================================

export const getCourseQuizzes = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { courseId } = req.params;
    const quizzes = await QuizModel.find({ courseId, isPublished: true }).select('-questions.correctOptionIndex -questions.explanation');
    return res.status(200).json({ quizzes });
  } catch (err: any) {
    logger.error(`[getCourseQuizzes] ${err.message}`);
    return res.status(500).json({ message: 'Lỗi server' });
  }
};

export const getQuizForStudent = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const quiz = await QuizModel.findOne({ _id: id, isPublished: true }).lean();
    if (!quiz) {
      return res.status(404).json({ message: 'Không tìm thấy quiz hoặc quiz chưa được publish' });
    }

    // Strip answers
    const sanitizedQuestions = quiz.questions.map(q => {
      const { correctOptionIndex, explanation, ...rest } = q;
      return rest;
    });

    return res.status(200).json({ quiz: { ...quiz, questions: sanitizedQuestions } });
  } catch (err: any) {
    logger.error(`[getQuizForStudent] ${err.message}`);
    return res.status(500).json({ message: 'Lỗi server' });
  }
};

export const submitQuiz = async (req: Request, res: Response): Promise<Response> => {
  try {
    const studentId = getStudentId(req);
    const { id } = req.params;
    const { answers } = req.body; // Array of selected option indexes

    if (!studentId) return res.status(401).json({ message: 'Chưa đăng nhập' });
    if (!Array.isArray(answers)) return res.status(400).json({ message: 'answers phải là một mảng các lựa chọn' });

    const quiz = await QuizModel.findById(id);
    if (!quiz || !quiz.isPublished) {
      return res.status(404).json({ message: 'Không tìm thấy quiz' });
    }

    if (answers.length !== quiz.questions.length) {
      return res.status(400).json({ message: 'Số lượng câu trả lời không khớp với số lượng câu hỏi' });
    }

    let correctAnswersCount = 0;
    quiz.questions.forEach((q, index) => {
      if (answers[index] === q.correctOptionIndex) {
        correctAnswersCount++;
      }
    });

    const score = (correctAnswersCount / quiz.questions.length) * 100;
    const passed = score >= quiz.passingScore;

    const quizResult = new QuizResultModel({
      studentId,
      quizId: id,
      score,
      totalQuestions: quiz.questions.length,
      correctAnswers: correctAnswersCount,
      passed,
      answers
    });

    await quizResult.save();

    // Trả về full questions có explanation để review
    return res.status(200).json({
      message: 'Nộp bài thành công',
      result: quizResult,
      quizReview: quiz // Trả về quiz đầy đủ để hiển thị đáp án đúng
    });
  } catch (err: any) {
    logger.error(`[submitQuiz] ${err.message}`);
    return res.status(500).json({ message: 'Lỗi server' });
  }
};

export const getStudentQuizHistory = async (req: Request, res: Response): Promise<Response> => {
  try {
    const studentId = getStudentId(req);
    const { courseId } = req.query;
    if (!studentId) return res.status(401).json({ message: 'Chưa đăng nhập' });

    let filter: any = { studentId };

    if (courseId) {
      // Tìm các quiz thuộc courseId này
      const quizzes = await QuizModel.find({ courseId }).select('_id');
      const quizIds = quizzes.map(q => q._id);
      filter.quizId = { $in: quizIds };
    }

    const history = await QuizResultModel.find(filter).sort({ createdAt: -1 }).populate('quizId', 'title passingScore');
    return res.status(200).json({ history });
  } catch (err: any) {
    logger.error(`[getStudentQuizHistory] ${err.message}`);
    return res.status(500).json({ message: 'Lỗi server' });
  }
};
