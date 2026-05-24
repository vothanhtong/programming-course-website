import CourseModel from '../models/course.models/course.model';
import EnrollmentModel from '../models/course.models/enrollment.model';
import ReviewModel from '../models/course.models/review.model';
import MessageModel from '../models/course.models/message.model';
import { memoryCache } from '../utils/cache';
import logger from '../config/logger';

export const statsService = {
  async adminGetStats() {
    const CACHE_KEY = 'admin:stats';
    const CACHE_TTL = 300;

    const cached = memoryCache.get<any>(CACHE_KEY);
    if (cached) {
      logger.debug('[adminGetStats] Cache hit');
      return cached;
    }

    logger.debug('[adminGetStats] Cache miss - fetching from DB');
    const [totalCourses, totalEnrollments, revenueAgg, pendingReviews, unreadMessages] = await Promise.all([
      CourseModel.countDocuments(),
      EnrollmentModel.countDocuments(),
      EnrollmentModel.aggregate([{ $match: { paymentStatus: 'paid' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      ReviewModel.countDocuments({ isApproved: false }),
      MessageModel.countDocuments({ isRead: false }),
    ]);

    const stats = {
      totalCourses,
      totalEnrollments,
      totalRevenue: revenueAgg[0]?.total || 0,
      pendingReviews,
      unreadMessages,
    };

    memoryCache.set(CACHE_KEY, stats, CACHE_TTL);

    return stats;
  }
};
