import { z } from 'zod';

// ── Admin Profile ──────────────────────────────────────────
export const updateAdminProfileSchema = z.object({
  body: z.object({
    fullName: z.string().min(2, 'Họ tên ít nhất 2 ký tự').max(100).optional(),
    email: z.string().email('Email không hợp lệ').optional(),
  }),
});

export const changeAdminPasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, 'Vui lòng nhập mật khẩu hiện tại'),
    newPassword: z.string().min(6, 'Mật khẩu mới phải ít nhất 6 ký tự'),
  }),
});

// ── Categories ─────────────────────────────────────────────
export const addCategorySchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Tên danh mục ít nhất 2 ký tự'),
    description: z.string().optional(),
    slug: z.string().optional(),
  }),
});

// ── Courses ────────────────────────────────────────────────
export const courseSchema = z.object({
  body: z.object({
    title: z.string().min(3, 'Tên khóa học ít nhất 3 ký tự'),
    category: z.string().min(1, 'Danh mục không được để trống'),
    level: z.enum(['beginner', 'intermediate', 'advanced']),
    price: z.number().min(0).optional(),
    salePrice: z.number().min(0).optional().nullable(),
    isFree: z.boolean().optional(),
    shortDescription: z.string().optional(),
    description: z.string().optional(),
    thumbnail: z.string().optional(),
    previewVideo: z.string().optional(),
    isPublished: z.boolean().optional(),
    isFeatured: z.boolean().optional(),
  }),
});

// ── Lessons ────────────────────────────────────────────────
export const lessonSchema = z.object({
  body: z.object({
    course: z.string().min(1, 'Khóa học không được để trống'),
    title: z.string().min(2, 'Tiêu đề bài học ít nhất 2 ký tự'),
    content: z.string().optional(),
    videoUrl: z.string().optional(),
    duration: z.number().min(0).optional(),
    order: z.number().min(0).optional(),
    isFreePreview: z.boolean().optional(),
    isPublished: z.boolean().optional(),
  }),
});

// ── Students ───────────────────────────────────────────────
export const createStudentSchema = z.object({
  body: z.object({
    fullName: z.string().min(2, 'Họ tên ít nhất 2 ký tự'),
    email: z.string().email('Email không hợp lệ'),
    password: z.string().min(6, 'Mật khẩu ít nhất 6 ký tự'),
  }),
});

export const updateStudentSchema = z.object({
  body: z.object({
    fullName: z.string().min(2).optional(),
    phone: z.string().optional(),
    bio: z.string().optional(),
  }),
});

export const resetStudentPasswordSchema = z.object({
  body: z.object({
    newPassword: z.string().min(6, 'Mật khẩu mới ít nhất 6 ký tự'),
  }),
});

export const grantCoursesSchema = z.object({
  body: z.object({
    courseIds: z.array(z.string()).min(1, 'Vui lòng chọn ít nhất 1 khóa học'),
  }),
});
