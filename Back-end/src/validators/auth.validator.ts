import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    fullName: z.string().min(2, 'Họ tên phải có ít nhất 2 ký tự').max(50, 'Họ tên tối đa 50 ký tự'),
    email: z.string().email('Email không hợp lệ'),
    password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
    phone: z.string().optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Email không hợp lệ'),
    password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email('Email không hợp lệ'),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1, 'Token không hợp lệ'),
    newPassword: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  }),
});
