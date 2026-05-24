import QuizModel from '../models/course.models/quiz.model';
import QuizResultModel from '../models/course.models/quizResult.model';

export const quizService: any = {
  async createQuiz(data: any) {
    const newQuiz = new QuizModel({
      courseId: data.courseId,
      title: data.title,
      description: data.description,
      questions: data.questions,
      passingScore: data.passingScore,
      isPublished: data.isPublished,
      lessonId: data.lessonId || undefined
    });
    await newQuiz.save();
    return newQuiz;
  },

  async updateQuiz(id: string, updateData: any) {
    const updatedQuiz = await QuizModel.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedQuiz) {
      const err: any = new Error('Không tìm thấy quiz');
      err.status = 404;
      throw err;
    }
    return updatedQuiz;
  },

  async deleteQuiz(id: string) {
    const deleted = await QuizModel.findByIdAndDelete(id);
    if (!deleted) {
      const err: any = new Error('Không tìm thấy quiz');
      err.status = 404;
      throw err;
    }
    await QuizResultModel.deleteMany({ quizId: id });
  },

  async getAdminQuizzes(query: any) {
    const filter = query.courseId ? { courseId: query.courseId } : {};
    const quizzes = await QuizModel.find(filter).sort({ createdAt: -1 });
    return { quizzes };
  },

  async getCourseQuizzes(courseId: string) {
    const quizzes = await QuizModel.find({ courseId, isPublished: true })
      .select('-questions.correctOptionIndex -questions.explanation');
    return { quizzes };
  },

  async getQuizForStudent(id: string) {
    const quiz = await QuizModel.findOne({ _id: id, isPublished: true }).lean();
    if (!quiz) {
      const err: any = new Error('Không tìm thấy quiz hoặc quiz chưa được publish');
      err.status = 404;
      throw err;
    }

    const sanitizedQuestions = quiz.questions.map(q => {
      const { correctOptionIndex, explanation, ...rest } = q as any;
      return rest;
    });

    return { quiz: { ...quiz, questions: sanitizedQuestions } };
  },

  async submitQuiz(id: string, studentId: string, answers: any[]) {
    const quiz = await QuizModel.findById(id);
    if (!quiz || !quiz.isPublished) {
      const err: any = new Error('Không tìm thấy quiz');
      err.status = 404;
      throw err;
    }

    if (answers.length !== quiz.questions.length) {
      const err: any = new Error('Số lượng câu trả lời không khớp với số lượng câu hỏi');
      err.status = 400;
      throw err;
    }

    let correctAnswersCount = 0;
    quiz.questions.forEach((q, index) => {
      if (answers[index] === (q as any).correctOptionIndex) {
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

    return { result: quizResult, quizReview: quiz };
  },

  async getStudentQuizHistory(studentId: string, query: any) {
    let filter: any = { studentId };

    if (query.courseId) {
      const quizzes = await QuizModel.find({ courseId: query.courseId }).select('_id');
      const quizIds = quizzes.map(q => q._id);
      filter.quizId = { $in: quizIds };
    }

    const history = await QuizResultModel.find(filter).sort({ createdAt: -1 }).populate('quizId', 'title passingScore');
    return { history };
  }
};
