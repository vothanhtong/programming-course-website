import ReviewModel from '../models/course.models/review.model';
import CourseModel from '../models/course.models/course.model';
import { invalidateAdminStatsCache } from '../utils/cache';

export const reviewService = {
  async postReview(data: any) {
    const review = await ReviewModel.create({
      courseId: data.courseId,
      studentName: data.studentName,
      rating: data.ratingNum,
      comment: data.commentText
    });
    return review;
  },

  async adminGetReviews(query: any) {
    const page = Math.max(1, parseInt(query.page as string) || 1);
    const perPage = Math.min(50, Math.max(1, parseInt(query.perPage as string) || 20));
    const filter: Record<string, unknown> = {};
    if (query.approved !== undefined) filter.isApproved = query.approved === 'true';

    const [total, reviews] = await Promise.all([
      ReviewModel.countDocuments(filter),
      ReviewModel.find(filter)
        .populate('courseId', 'title')
        .sort({ createdAt: -1 })
        .skip((page - 1) * perPage).limit(perPage).lean(),
    ]);
    return { reviews, total, page, perPage };
  },

  async adminApproveReview(id: string) {
    const review = await ReviewModel.findByIdAndUpdate(id, { isApproved: true }, { new: true });
    if (!review) {
      const err: any = new Error('Không tìm thấy');
      err.status = 404;
      throw err;
    }

    const [agg] = await ReviewModel.aggregate([
      { $match: { courseId: review.courseId, isApproved: true } },
      { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);

    if (agg) {
      await CourseModel.updateOne(
        { _id: review.courseId },
        { rating: Math.round(agg.avg * 10) / 10, ratingCount: agg.count }
      );
    }
    invalidateAdminStatsCache();
  },

  async adminDeleteReview(id: string) {
    const review = await ReviewModel.findByIdAndDelete(id);
    if (review) {
      const [agg] = await ReviewModel.aggregate([
        { $match: { courseId: review.courseId, isApproved: true } },
        { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
      ]);
      await CourseModel.updateOne(
        { _id: review.courseId },
        agg
          ? { rating: Math.round(agg.avg * 10) / 10, ratingCount: agg.count }
          : { rating: 0, ratingCount: 0 }
      );
    }
    invalidateAdminStatsCache();
  }
};
