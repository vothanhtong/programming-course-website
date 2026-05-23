import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Request, Response } from 'express';

const mockRes = () => ({ status: vi.fn().mockReturnThis(), json: vi.fn().mockReturnThis() } as unknown as Response);
const mockReq = (overrides: Partial<Request> = {}): Request =>
  ({ query: {}, params: {}, body: {}, headers: {}, ...overrides } as unknown as Request);

// Mock message.model và progress.model để tránh OverwriteModelError khi import nhiều lần
const mockAllModels = () => {
  vi.doMock('../models/course.models/course.model',     () => ({ default: { create: vi.fn(), find: vi.fn(), findById: vi.fn(), findByIdAndUpdate: vi.fn(), findByIdAndDelete: vi.fn(), countDocuments: vi.fn(), updateOne: vi.fn(), updateMany: vi.fn(), aggregate: vi.fn() } }));
  vi.doMock('../models/course.models/category.model',   () => ({ default: { find: vi.fn(), create: vi.fn(), findByIdAndDelete: vi.fn() } }));
  vi.doMock('../models/course.models/lesson.model',     () => ({ default: { find: vi.fn(), create: vi.fn(), findByIdAndUpdate: vi.fn(), findByIdAndDelete: vi.fn(), countDocuments: vi.fn(), deleteMany: vi.fn() } }));
  vi.doMock('../models/course.models/review.model',     () => ({ default: { find: vi.fn(), create: vi.fn(), findByIdAndUpdate: vi.fn(), findByIdAndDelete: vi.fn(), countDocuments: vi.fn(), deleteMany: vi.fn(), aggregate: vi.fn() } }));
  vi.doMock('../models/course.models/enrollment.model', () => ({ default: { find: vi.fn(), create: vi.fn(), findById: vi.fn(), findByIdAndUpdate: vi.fn(), findOne: vi.fn().mockReturnValue({ lean: vi.fn().mockResolvedValue(null) }), countDocuments: vi.fn(), aggregate: vi.fn(), deleteMany: vi.fn() } }));
  vi.doMock('../models/course.models/message.model',    () => ({ default: { countDocuments: vi.fn().mockResolvedValue(0) } }));
  vi.doMock('../models/course.models/progress.model',   () => ({ default: { deleteMany: vi.fn(), findOne: vi.fn(), create: vi.fn() } }));
  vi.doMock('../models/student.model',                  () => ({ default: { updateOne: vi.fn(), findById: vi.fn(), updateMany: vi.fn() } }));
  vi.doMock('../controllers/progress.controller',       () => ({ initializeProgressForEnrollment: vi.fn().mockResolvedValue(undefined) }));
};

describe('postEnroll - validation', () => {
  beforeEach(() => { vi.resetModules(); });

  it('400 khi thiếu courseId', async () => {
    mockAllModels();
    const { postEnroll } = await import('./course.controller');
    const res = mockRes();
    await postEnroll(mockReq({ body: { studentName: 'Test', studentEmail: 'test@test.com' } }), res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Thiếu thông tin bắt buộc' });
  });

  it('400 khi courseId không hợp lệ', async () => {
    mockAllModels();
    const { postEnroll } = await import('./course.controller');
    const res = mockRes();
    await postEnroll(mockReq({ body: { courseId: 'bad-id', studentName: 'Test', studentEmail: 'test@test.com' } }), res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'courseId không hợp lệ' });
  });

  it('400 khi email không hợp lệ', async () => {
    mockAllModels();
    const { postEnroll } = await import('./course.controller');
    const res = mockRes();
    await postEnroll(mockReq({ body: { courseId: '507f1f77bcf86cd799439011', studentName: 'Test', studentEmail: 'not-email' } }), res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Email không hợp lệ' });
  });

  it('404 khi khóa học không tồn tại', async () => {
    vi.doMock('../models/course.models/course.model', () => ({
      default: { findById: vi.fn().mockReturnValue({ select: vi.fn().mockReturnValue({ lean: vi.fn().mockResolvedValue(null) }) }) },
    }));
    vi.doMock('../models/course.models/category.model',   () => ({ default: {} }));
    vi.doMock('../models/course.models/lesson.model',     () => ({ default: {} }));
    vi.doMock('../models/course.models/review.model',     () => ({ default: {} }));
    vi.doMock('../models/course.models/enrollment.model', () => ({ default: {} }));
    vi.doMock('../models/course.models/message.model',    () => ({ default: {} }));
    vi.doMock('../models/student.model',                  () => ({ default: {} }));
    const { postEnroll } = await import('./course.controller');
    const res = mockRes();
    await postEnroll(mockReq({ body: { courseId: '507f1f77bcf86cd799439011', studentName: 'Test', studentEmail: 'test@test.com' } }), res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('201 và cập nhật enrolledCourses khi có studentId', async () => {
    const studentUpdateMock = vi.fn().mockResolvedValue({});
    vi.doMock('../models/course.models/course.model', () => ({
      default: {
        findById: vi.fn().mockReturnValue({ select: vi.fn().mockReturnValue({ lean: vi.fn().mockResolvedValue({ isPublished: true, isFree: true, price: 0, salePrice: null }) }) }),
        updateOne: vi.fn().mockResolvedValue({}),
      },
    }));
    vi.doMock('../models/course.models/enrollment.model', () => ({
      default: {
        findOne: vi.fn().mockReturnValue({ lean: vi.fn().mockResolvedValue(null) }),
        create:  vi.fn().mockResolvedValue({ _id: 'enroll-id' }),
      },
    }));
    vi.doMock('../models/student.model', () => ({
      default: {
        // findById dùng để lấy email từ tài khoản đã đăng nhập
        findById: vi.fn().mockReturnValue({ select: vi.fn().mockReturnValue({ lean: vi.fn().mockResolvedValue({ email: 'test@test.com' }) }) }),
        updateOne: studentUpdateMock,
      },
    }));
    vi.doMock('../models/course.models/category.model',   () => ({ default: {} }));
    vi.doMock('../models/course.models/lesson.model',     () => ({ default: {} }));
    vi.doMock('../models/course.models/review.model',     () => ({ default: {} }));
    vi.doMock('../models/course.models/message.model',    () => ({ default: {} }));
    const { postEnroll } = await import('./course.controller');
    const req = mockReq({ body: { courseId: '507f1f77bcf86cd799439011', studentName: 'Test', studentEmail: 'test@test.com' } });
    // Dùng ObjectId hợp lệ để isValidId() pass
    (req as any).studentId = '507f191e810c19729de860ea';
    const res = mockRes();
    await postEnroll(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(studentUpdateMock).toHaveBeenCalledWith(
      { _id: '507f191e810c19729de860ea' },
      { $addToSet: { enrolledCourses: '507f1f77bcf86cd799439011' } }
    );
  });
});

describe('postReview - validation', () => {
  beforeEach(() => { vi.resetModules(); });

  it('400 khi rating > 5', async () => {
    mockAllModels();
    const { postReview } = await import('./course.controller');
    const res = mockRes();
    await postReview(mockReq({ body: { courseId: '507f1f77bcf86cd799439011', studentName: 'Test', rating: 6 } }), res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Rating phải từ 1 đến 5' });
  });

  it('400 khi thiếu studentName', async () => {
    mockAllModels();
    const { postReview } = await import('./course.controller');
    const res = mockRes();
    await postReview(mockReq({ body: { courseId: '507f1f77bcf86cd799439011', rating: 4 } }), res);
    expect(res.status).toHaveBeenCalledWith(400);
  });
});

describe('adminAddCourse - validation', () => {
  beforeEach(() => { vi.resetModules(); });

  it('400 khi thiếu title', async () => {
    mockAllModels();
    const { adminAddCourse } = await import('./course.controller');
    const res = mockRes();
    await adminAddCourse(mockReq({ body: { category: '507f1f77bcf86cd799439011', price: 0 } }), res);
    expect(res.status).toHaveBeenCalledWith(400);
    // Kiểm tra message thực tế từ controller
    expect(res.json).toHaveBeenCalledWith({ message: 'Thiếu title' });
  });

  it('400 khi category ID không hợp lệ', async () => {
    mockAllModels();
    const { adminAddCourse } = await import('./course.controller');
    const res = mockRes();
    await adminAddCourse(mockReq({ body: { title: 'Test', category: 'bad-id', price: 0 } }), res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Category ID không hợp lệ' });
  });

  it('400 khi giá âm', async () => {
    mockAllModels();
    const { adminAddCourse } = await import('./course.controller');
    const res = mockRes();
    await adminAddCourse(mockReq({ body: { title: 'Test', category: '507f1f77bcf86cd799439011', price: -100 } }), res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Giá không được âm' });
  });

  it('201 khi tạo thành công', async () => {
    vi.doMock('../models/course.models/course.model', () => ({ default: { create: vi.fn().mockResolvedValue({ _id: 'new-id', title: 'React', slug: 'react-123' }) } }));
    vi.doMock('../models/course.models/category.model',   () => ({ default: {} }));
    vi.doMock('../models/course.models/lesson.model',     () => ({ default: {} }));
    vi.doMock('../models/course.models/review.model',     () => ({ default: {} }));
    vi.doMock('../models/course.models/enrollment.model', () => ({ default: {} }));
    vi.doMock('../models/course.models/message.model',    () => ({ default: {} }));
    vi.doMock('../models/student.model',                  () => ({ default: {} }));
    const { adminAddCourse } = await import('./course.controller');
    const res = mockRes();
    await adminAddCourse(mockReq({ body: { title: 'React Cơ Bản', category: '507f1f77bcf86cd799439011', price: 0 } }), res);
    expect(res.status).toHaveBeenCalledWith(201);
  });
});
