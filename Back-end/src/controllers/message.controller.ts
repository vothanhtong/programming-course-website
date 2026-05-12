import { Request, Response } from 'express';
import MessageModel from '../models/course.models/message.model';
import logger from '../configs/logger';
import { isValidId, getParam, sanitizeStr, EMAIL_REGEX } from '../utils/validators';

// ── PUBLIC ────────────────────────────────────────────────

export const postMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, phone, message } = req.body;
    
    // Validate required fields
    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin' });
      return;
    }

    // Validate email format
    if (!EMAIL_REGEX.test(email)) {
      res.status(400).json({ message: 'Email không hợp lệ' });
      return;
    }

    // Sanitize inputs
    const safeName = sanitizeStr(name, 100);
    const safeMessage = sanitizeStr(message, 2000);

    if (safeName.length < 2) {
      res.status(400).json({ message: 'Tên phải có ít nhất 2 ký tự' });
      return;
    }

    if (safeMessage.length < 10) {
      res.status(400).json({ message: 'Tin nhắn phải có ít nhất 10 ký tự' });
      return;
    }

    await MessageModel.create({
      name: safeName,
      email: email.trim().toLowerCase(),
      phone: phone?.trim() || '',
      message: safeMessage,
    });

    res.status(201).json({ 
      message: 'Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi sớm nhất.' 
    });
  } catch (err) {
    logger.error('[postMessage]', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// ── ADMIN ─────────────────────────────────────────────────

export const adminGetMessages = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const perPage = Math.min(100, Math.max(1, parseInt(req.query.perPage as string) || 20));
    const { isRead } = req.query as { isRead?: string };

    const filter: Record<string, unknown> = {};
    if (isRead !== undefined) {
      filter.isRead = isRead === 'true';
    }

    const [total, messages] = await Promise.all([
      MessageModel.countDocuments(filter),
      MessageModel.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * perPage)
        .limit(perPage)
        .lean(),
    ]);

    res.json({ messages, total, page, perPage });
  } catch (err) {
    logger.error('[adminGetMessages]', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

export const adminMarkRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = getParam(req.params.id);
    if (!isValidId(id)) {
      res.status(400).json({ message: 'ID không hợp lệ' });
      return;
    }

    const message = await MessageModel.findByIdAndUpdate(
      id,
      { isRead: true },
      { new: true }
    );

    if (!message) {
      res.status(404).json({ message: 'Không tìm thấy tin nhắn' });
      return;
    }

    res.json({ message: 'Đã đánh dấu đã đọc', data: message });
  } catch (err) {
    logger.error('[adminMarkRead]', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

export const adminDeleteMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = getParam(req.params.id);
    if (!isValidId(id)) {
      res.status(400).json({ message: 'ID không hợp lệ' });
      return;
    }

    const message = await MessageModel.findByIdAndDelete(id);
    if (!message) {
      res.status(404).json({ message: 'Không tìm thấy tin nhắn' });
      return;
    }

    res.json({ message: 'Đã xóa tin nhắn' });
  } catch (err) {
    logger.error('[adminDeleteMessage]', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

export const adminUnreadCount = async (_req: Request, res: Response): Promise<void> => {
  try {
    const count = await MessageModel.countDocuments({ isRead: false });
    res.json({ count });
  } catch (err) {
    logger.error('[adminUnreadCount]', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};
