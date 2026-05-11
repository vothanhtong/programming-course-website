import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Request, Response } from 'express';

const mockRes = () => ({ status: vi.fn().mockReturnThis(), json: vi.fn().mockReturnThis() } as unknown as Response);
const mockReq = (overrides: Partial<Request> = {}): Request =>
  ({ query: {}, params: {}, body: {}, headers: {}, ...overrides } as unknown as Request);

describe('register - validation', () => {
  beforeEach(() => { vi.resetModules(); });

  it('400 khi thiếu fullName', async () => {
    vi.doMock('../models/student.model', () => ({ default: { findOne: vi.fn(), create: vi.fn() } }));
    vi.doMock('../utils/mailer', () => ({ sendMail: vi.fn(), resetPasswordTemplate: vi.fn() }));
    const { register } = await import('./auth.controller');
    const res = mockRes();
    await register(mockReq({ body: { email: 'a@b.com', password: '123456' } }), res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Vui lòng điền đầy đủ thông tin' });
  });

  it('400 khi email không hợp lệ', async () => {
    vi.doMock('../models/student.model', () => ({ default: { findOne: vi.fn(), create: vi.fn() } }));
    vi.doMock('../utils/mailer', () => ({ sendMail: vi.fn(), resetPasswordTemplate: vi.fn() }));
    const { register } = await import('./auth.controller');
    const res = mockRes();
    await register(mockReq({ body: { fullName: 'Test', email: 'not-email', password: '123456' } }), res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Email không hợp lệ' });
  });

  it('400 khi mật khẩu quá ngắn', async () => {
    vi.doMock('../models/student.model', () => ({ default: { findOne: vi.fn(), create: vi.fn() } }));
    vi.doMock('../utils/mailer', () => ({ sendMail: vi.fn(), resetPasswordTemplate: vi.fn() }));
    const { register } = await import('./auth.controller');
    const res = mockRes();
    await register(mockReq({ body: { fullName: 'Test', email: 'a@b.com', password: '123' } }), res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Mật khẩu phải ít nhất 6 ký tự' });
  });

  it('409 khi email đã tồn tại', async () => {
    vi.doMock('../models/student.model', () => ({
      default: { findOne: vi.fn().mockResolvedValue({ _id: 'x', email: 'a@b.com' }), create: vi.fn() },
    }));
    vi.doMock('../utils/mailer', () => ({ sendMail: vi.fn(), resetPasswordTemplate: vi.fn() }));
    const { register } = await import('./auth.controller');
    const res = mockRes();
    await register(mockReq({ body: { fullName: 'Test', email: 'a@b.com', password: '123456' } }), res);
    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({ message: 'Email đã được đăng ký' });
  });
});

describe('login - validation', () => {
  beforeEach(() => { vi.resetModules(); });

  it('400 khi thiếu email', async () => {
    vi.doMock('../models/student.model', () => ({ default: { findOne: vi.fn() } }));
    vi.doMock('../utils/mailer', () => ({ sendMail: vi.fn(), resetPasswordTemplate: vi.fn() }));
    const { login } = await import('./auth.controller');
    const res = mockRes();
    await login(mockReq({ body: { password: '123456' } }), res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('401 khi email không tồn tại', async () => {
    vi.doMock('../models/student.model', () => ({ default: { findOne: vi.fn().mockResolvedValue(null) } }));
    vi.doMock('../utils/mailer', () => ({ sendMail: vi.fn(), resetPasswordTemplate: vi.fn() }));
    const { login } = await import('./auth.controller');
    const res = mockRes();
    await login(mockReq({ body: { email: 'x@b.com', password: '123456' } }), res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('401 khi sai mật khẩu', async () => {
    vi.doMock('../models/student.model', () => ({
      default: { findOne: vi.fn().mockResolvedValue({ _id: 'x', email: 'a@b.com', comparePassword: vi.fn().mockResolvedValue(false) }) },
    }));
    vi.doMock('../utils/mailer', () => ({ sendMail: vi.fn(), resetPasswordTemplate: vi.fn() }));
    const { login } = await import('./auth.controller');
    const res = mockRes();
    await login(mockReq({ body: { email: 'a@b.com', password: 'wrong' } }), res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Email hoặc mật khẩu không đúng' });
  });
});

describe('forgotPassword', () => {
  beforeEach(() => { vi.resetModules(); });

  it('400 khi thiếu email', async () => {
    vi.doMock('../models/student.model', () => ({ default: { findOne: vi.fn() } }));
    vi.doMock('../utils/mailer', () => ({ sendMail: vi.fn(), resetPasswordTemplate: vi.fn() }));
    const { forgotPassword } = await import('./auth.controller');
    const res = mockRes();
    await forgotPassword(mockReq({ body: {} }), res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('200 kể cả khi email không tồn tại (tránh lộ thông tin)', async () => {
    vi.doMock('../models/student.model', () => ({ default: { findOne: vi.fn().mockResolvedValue(null) } }));
    vi.doMock('../utils/mailer', () => ({ sendMail: vi.fn(), resetPasswordTemplate: vi.fn() }));
    const { forgotPassword } = await import('./auth.controller');
    const res = mockRes();
    await forgotPassword(mockReq({ body: { email: 'notexist@b.com' } }), res);
    expect(res.status).not.toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining('Nếu email tồn tại') }));
  });

  it('gọi sendMail khi email tồn tại', async () => {
    const sendMailMock = vi.fn().mockResolvedValue(true);
    const saveMock = vi.fn().mockResolvedValue(true);
    vi.doMock('../models/student.model', () => ({
      default: { findOne: vi.fn().mockResolvedValue({ _id: 'x', email: 'a@b.com', fullName: 'Test', resetToken: null, resetTokenExpiry: null, save: saveMock }) },
    }));
    vi.doMock('../utils/mailer', () => ({ sendMail: sendMailMock, resetPasswordTemplate: vi.fn().mockReturnValue('<html>reset</html>') }));
    process.env.JWT_SECRET_KEY = 'test-secret';
    process.env.FRONTEND_URL   = 'http://localhost:8080';
    const { forgotPassword } = await import('./auth.controller');
    const res = mockRes();
    await forgotPassword(mockReq({ body: { email: 'a@b.com' } }), res);
    expect(saveMock).toHaveBeenCalledOnce();
    expect(sendMailMock).toHaveBeenCalledOnce();
  });
});

describe('changePassword - validation', () => {
  beforeEach(() => { vi.resetModules(); });

  it('400 khi mật khẩu mới quá ngắn', async () => {
    vi.doMock('../models/student.model', () => ({ default: { findById: vi.fn() } }));
    vi.doMock('../utils/mailer', () => ({ sendMail: vi.fn(), resetPasswordTemplate: vi.fn() }));
    const { changePassword } = await import('./auth.controller');
    const req = mockReq({ body: { currentPassword: 'old', newPassword: '123' } });
    (req as any).studentId = 'x';
    const res = mockRes();
    await changePassword(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Mật khẩu mới phải ít nhất 6 ký tự' });
  });
});

describe('resetPassword - validation', () => {
  beforeEach(() => { vi.resetModules(); });

  it('400 khi thiếu token', async () => {
    vi.doMock('../models/student.model', () => ({ default: { findOne: vi.fn() } }));
    vi.doMock('../utils/mailer', () => ({ sendMail: vi.fn(), resetPasswordTemplate: vi.fn() }));
    const { resetPassword } = await import('./auth.controller');
    const res = mockRes();
    await resetPassword(mockReq({ body: { newPassword: 'newpass123' } }), res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Thiếu thông tin' });
  });

  it('400 khi token hết hạn', async () => {
    vi.doMock('../models/student.model', () => ({ default: { findOne: vi.fn().mockResolvedValue(null) } }));
    vi.doMock('../utils/mailer', () => ({ sendMail: vi.fn(), resetPasswordTemplate: vi.fn() }));
    const { resetPassword } = await import('./auth.controller');
    const res = mockRes();
    await resetPassword(mockReq({ body: { token: 'expired', newPassword: 'newpass123' } }), res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Token không hợp lệ hoặc đã hết hạn' });
  });
});
