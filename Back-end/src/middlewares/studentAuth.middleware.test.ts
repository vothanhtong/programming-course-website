import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { studentAuthentication } from './studentAuth.middleware';

const SECRET = 'test-secret';
const mockRes = () => ({ status: vi.fn().mockReturnThis(), json: vi.fn().mockReturnThis() } as unknown as Response);
const mockNext: NextFunction = vi.fn();

beforeEach(() => { process.env.JWT_SECRET_KEY = SECRET; vi.clearAllMocks(); });

describe('studentAuthentication middleware', () => {
  it('401 khi không có token', () => {
    const res = mockRes();
    studentAuthentication({ headers: {} } as Request, res, mockNext);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Vui lòng đăng nhập' });
  });

  it('403 khi role không phải student', () => {
    const token = jwt.sign({ sub: { studentId: 'id', role: 'admin' } }, SECRET);
    const res = mockRes();
    studentAuthentication({ headers: { authorization: `Bearer ${token}` } } as Request, res, mockNext);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('next() và gán studentId khi token hợp lệ', () => {
    const token = jwt.sign({ sub: { studentId: 'stu-xyz', role: 'student' } }, SECRET);
    const req = { headers: { authorization: `Bearer ${token}` } } as any;
    studentAuthentication(req, mockRes(), mockNext);
    expect(mockNext).toHaveBeenCalledOnce();
    expect(req.studentId).toBe('stu-xyz');
  });

  it('401 khi token không hợp lệ', () => {
    const res = mockRes();
    studentAuthentication({ headers: { authorization: 'Bearer bad.token' } } as Request, res, mockNext);
    expect(res.status).toHaveBeenCalledWith(401);
  });
});
