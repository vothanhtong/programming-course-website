/**
 * Shared validation utilities — dùng chung cho tất cả controllers
 * Tránh duplicate code và đảm bảo nhất quán
 */
import mongoose from 'mongoose';

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const URL_REGEX   = /^https?:\/\/.+/i;

export const VALID_LEVELS        = ['beginner', 'intermediate', 'advanced'] as const;
export const VALID_PAYMENT_STATUSES = ['pending', 'paid', 'failed', 'refunded'] as const;
export const VALID_PAYMENT_METHODS  = ['bank_transfer', 'momo', 'vnpay', 'free', 'granted', 'other'] as const;

export type CourseLevel    = typeof VALID_LEVELS[number];
export type PaymentStatus  = typeof VALID_PAYMENT_STATUSES[number];
export type PaymentMethod  = typeof VALID_PAYMENT_METHODS[number];

/** Kiểm tra MongoDB ObjectId hợp lệ */
export const isValidId = (id: unknown): id is string =>
  typeof id === 'string' && mongoose.Types.ObjectId.isValid(id);

/** Lấy string từ param (có thể là string | string[]) */
export const getParam = (param: string | string[]): string =>
  Array.isArray(param) ? param[0] : param;

/** Sanitize string — trim và giới hạn độ dài */
export const sanitizeStr = (val: unknown, maxLen = 500): string => {
  if (typeof val !== 'string') return '';
  return val.trim().slice(0, maxLen);
};

/** Validate avatar URL — chấp nhận http/https hoặc relative path /uploads/... */
export const isValidAvatarUrl = (url: unknown): boolean => {
  if (!url || typeof url !== 'string') return true; // optional field
  if (url.startsWith('/uploads/')) return url.length <= 500; // local upload
  return URL_REGEX.test(url) && url.length <= 500;
};

/** Escape regex special chars để tránh ReDoS */
export const escapeRegex = (str: string): string =>
  str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
