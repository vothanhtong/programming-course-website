import MessageModel from '../models/course.models/message.model';
import StudentModel from '../models/student.model';
import { invalidateAdminStatsCache } from '../utils/cache';

export const messageService = {
  async postMessage(data: any) {
    const message = await MessageModel.create({
      name: data.safeName,
      email: data.email,
      phone: data.phone || '',
      message: data.safeMessage,
    });
    return message;
  },

  async getMessagesByEmail(studentId: string, query: any) {
    const student = await StudentModel.findById(studentId).select('email').lean();
    if (!student) {
      const err: any = new Error('Không tìm thấy tài khoản');
      err.status = 404;
      throw err;
    }

    const limit = Math.min(50, Math.max(1, parseInt(query.limit as string) || 20));
    const cursor = query.cursor as string | undefined;

    const filter: Record<string, unknown> = { email: student.email };
    
    if (cursor) {
      const cursorMessage = await MessageModel.findById(cursor).select('createdAt').lean();
      if (cursorMessage) {
        filter.createdAt = { $lt: cursorMessage.createdAt };
      }
    }

    const messages = await MessageModel.find(filter)
      .select('name message adminReply repliedAt isRead createdAt')
      .sort({ createdAt: -1 })
      .limit(limit + 1)
      .lean();

    const hasMore = messages.length > limit;
    const resultMessages = hasMore ? messages.slice(0, limit) : messages;
    const nextCursor = hasMore && resultMessages.length > 0 
      ? resultMessages[resultMessages.length - 1]._id.toString() 
      : null;

    return { 
      messages: resultMessages,
      hasMore,
      nextCursor,
      total: resultMessages.length,
    };
  },

  async adminGetMessages(query: any) {
    const page = Math.max(1, parseInt(query.page as string) || 1);
    const perPage = Math.min(100, Math.max(1, parseInt(query.perPage as string) || 20));
    const filter: Record<string, unknown> = {};
    if (query.isRead !== undefined) filter.isRead = query.isRead === 'true';

    const [total, messages] = await Promise.all([
      MessageModel.countDocuments(filter),
      MessageModel.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * perPage)
        .limit(perPage)
        .lean(),
    ]);

    return { messages, total, page, perPage };
  },

  async adminMarkRead(id: string) {
    const message = await MessageModel.findByIdAndUpdate(id, { isRead: true }, { new: true });
    if (!message) {
      const err: any = new Error('Không tìm thấy tin nhắn');
      err.status = 404;
      throw err;
    }
    invalidateAdminStatsCache();
    return message;
  },

  async adminReplyMessage(id: string, safeReply: string) {
    const message = await MessageModel.findByIdAndUpdate(
      id,
      { adminReply: safeReply, repliedAt: new Date(), isRead: true },
      { new: true }
    );
    if (!message) {
      const err: any = new Error('Không tìm thấy tin nhắn');
      err.status = 404;
      throw err;
    }
    return message;
  },

  async adminDeleteMessage(id: string) {
    const message = await MessageModel.findByIdAndDelete(id);
    if (!message) {
      const err: any = new Error('Không tìm thấy tin nhắn');
      err.status = 404;
      throw err;
    }
  },

  async adminUnreadCount() {
    return await MessageModel.countDocuments({ isRead: false });
  }
};
