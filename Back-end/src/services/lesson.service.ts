import LessonModel from '../models/course.models/lesson.model';
import CourseModel from '../models/course.models/course.model';

export const lessonService = {
  async adminGetLessons(courseId: string) {
    const lessons = await LessonModel.find({ courseId }).sort({ order: 1 }).lean();
    return { lessons };
  },

  async adminAddLesson(data: any) {
    const lesson = await LessonModel.create(data);
    const count = await LessonModel.countDocuments({ courseId: data.courseId });
    await CourseModel.updateOne({ _id: data.courseId }, { totalLessons: count });
    return lesson;
  },

  async adminUpdateLesson(id: string, data: any) {
    const lesson = await LessonModel.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!lesson) {
      const err: any = new Error('Không tìm thấy bài học');
      err.status = 404;
      throw err;
    }
    return lesson;
  },

  async adminDeleteLesson(id: string) {
    const lesson = await LessonModel.findByIdAndDelete(id);
    if (lesson) {
      const count = await LessonModel.countDocuments({ courseId: lesson.courseId });
      await CourseModel.updateOne({ _id: lesson.courseId }, { totalLessons: count });
    }
  }
};
