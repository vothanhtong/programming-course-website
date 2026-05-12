import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('resetPasswordTemplate', () => {
  it('chứa reset URL và tên người dùng', async () => {
    const { resetPasswordTemplate } = await import('./mailer');
    const url  = 'http://localhost:8080/reset-password?token=abc123';
    const html = resetPasswordTemplate(url, 'Nguyễn Văn A');
    expect(html).toContain(url);
    expect(html).toContain('Nguyễn Văn A');
    expect(html).toContain('Đặt lại mật khẩu');
  });

  it('hoạt động không có fullName', async () => {
    const { resetPasswordTemplate } = await import('./mailer');
    const html = resetPasswordTemplate('http://example.com/reset?token=xyz');
    expect(html).toContain('http://example.com/reset?token=xyz');
    expect(html).not.toContain('undefined');
  });
});

describe('sendMail - SMTP chưa cấu hình', () => {
  beforeEach(() => {
    delete process.env.SMTP_HOST;
    delete process.env.SMTP_USER;
    delete process.env.SMTP_PASS;
    vi.resetModules();
  });

  it('trả về false khi SMTP chưa cấu hình', async () => {
    const { sendMail } = await import('./mailer');
    const result = await sendMail({ to: 'test@example.com', subject: 'Test', html: '<p>Test</p>' });
    expect(result).toBe(false);
  });
});
