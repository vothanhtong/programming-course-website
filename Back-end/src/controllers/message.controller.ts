import { Request, Response, NextFunction } from 'express';
import { isValidId, getParam, sanitizeStr, EMAIL_REGEX } from '../utils/validators';
import { messageService } from '../services/message.service';

// ── PUBLIC ────────────────────────────────────────────────

export const postMessage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, email, phone, message } = req.body;

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin' }); return;
    }
    if (!EMAIL_REGEX.test(email)) {
      res.status(400).json({ message: 'Email không hợp lệ' }); return;
    }

    const safeName    = sanitizeStr(name, 100);
    const safeMessage = sanitizeStr(message, 2000);

    if (safeName.length < 2) {
      res.status(400).json({ message: 'Tên phải có ít nhất 2 ký tự' }); return;
    }
    if (safeMessage.length < 10) {
      res.status(400).json({ message: 'Tin nhắn phải có ít nhất 10 ký tự' }); return;
    }

    await messageService.postMessage({ safeName, email: email.trim().toLowerCase(), phone: phone?.trim(), safeMessage });

    res.status(201).json({ message: 'Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi sớm nhất.' });
  } catch (err) { next(err); }
};

// ── PROTECTED: Student lấy lịch sử chat của chính mình ──
export const getMessagesByEmail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const studentId = (req as any).studentId as string | undefined;
    if (!studentId || !isValidId(studentId)) {
      res.status(401).json({ message: 'Chưa đăng nhập' }); return;
    }

    const result = await messageService.getMessagesByEmail(studentId, req.query);
    res.json(result);
  } catch (err) { next(err); }
};

// ── ADMIN ─────────────────────────────────────────────────

export const adminGetMessages = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await messageService.adminGetMessages(req.query);
    res.json(result);
  } catch (err) { next(err); }
};

export const adminMarkRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = getParam(req.params.id);
    if (!isValidId(id)) { res.status(400).json({ message: 'ID không hợp lệ' }); return; }

    const data = await messageService.adminMarkRead(id);
    res.json({ message: 'Đã đánh dấu đã đọc', data });
  } catch (err) { next(err); }
};

export const adminReplyMessage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = getParam(req.params.id);
    if (!isValidId(id)) { res.status(400).json({ message: 'ID không hợp lệ' }); return; }

    const { reply } = req.body;
    if (!reply?.trim()) { res.status(400).json({ message: 'Nội dung trả lời không được để trống' }); return; }

    const safeReply = sanitizeStr(reply, 2000);
    if (safeReply.length < 2) { res.status(400).json({ message: 'Nội dung trả lời quá ngắn' }); return; }

    const data = await messageService.adminReplyMessage(id, safeReply);
    res.json({ message: 'Đã gửi trả lời', data });
  } catch (err) { next(err); }
};

export const adminDeleteMessage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = getParam(req.params.id);
    if (!isValidId(id)) { res.status(400).json({ message: 'ID không hợp lệ' }); return; }

    await messageService.adminDeleteMessage(id);
    res.json({ message: 'Đã xóa tin nhắn' });
  } catch (err) { next(err); }
};

export const adminUnreadCount = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const count = await messageService.adminUnreadCount();
    res.json({ count });
  } catch (err) { next(err); }
};
