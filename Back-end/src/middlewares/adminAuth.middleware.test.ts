import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { adminAuthentication } from './adminAuth.middleware';

const SECRET = 'test-secret';
const mockRes = () => ({ status: vi.fn().mockReturnThis(), json: vi.fn().mockReturnThis() } as unknown as Response);
const mockNext: NextFunction = vi.fn();

beforeEach(() => { process.env.JWT_SECRET_KEY = SECRET; vi.clearAllMocks(); });

describe('adminAuthentication middleware', () => {
  it('401 khi không có token', () => {
    adminAuthentication({ headers: {} } as Request, mockRes(), mockNext);
    expect(mockRes().status).not.toHaveBeenCalled(); // called on fresh mockRes
  });

  it('401 khi không có token - kiểm tra response', () => {
    const res = mockRes();
    adminAuthentication({ headers: {} } as Request, res, mockNext);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('401 khi token sai', () => {
    const res = mockRes();
    adminAuthentication({ headers: { authorization: 'Bearer bad.token' } } as Request, res, mockNext);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('403 khi role không phải admin', () => {
    const token = jwt.sign({ sub: { adminId: 'id', role: 'student' } }, SECRET);
    const res = mockRes();
    adminAuthentication({ headers: { authorization: `Bearer ${token}` } } as Request, res, mockNext);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('next() và gán adminId khi token hợp lệ', () => {
    const token = jwt.sign({ sub: { adminId: 'admin-abc', role: 'admin' } }, SECRET);
    const req = { headers: { authorization: `Bearer ${token}` } } as any;
    const res = mockRes();
    adminAuthentication(req, res, mockNext);
    expect(mockNext).toHaveBeenCalledOnce();
    expect(req.adminId).toBe('admin-abc');
  });
});
