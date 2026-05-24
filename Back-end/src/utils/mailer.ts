import nodemailer from 'nodemailer';
import logger from '../config/logger';

const createTransporter = () => {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    logger.warn('⚠️  SMTP chưa cấu hình — email sẽ không được gửi.');
    return null;
  }

  return nodemailer.createTransport({
    host,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_PORT === '465',
    auth: { user, pass },
  });
};

let transporter: ReturnType<typeof nodemailer.createTransport> | null = null;
const getTransporter = () => {
  if (!transporter) transporter = createTransporter();
  return transporter;
};

interface MailOptions { to: string; subject: string; html: string; }

export const sendMail = async (options: MailOptions): Promise<boolean> => {
  const t = getTransporter();
  if (!t) {
    logger.warn(`[mailer] Email không gửi được tới ${options.to} — SMTP chưa cấu hình`);
    return false;
  }
  try {
    await t.sendMail({
      from:    process.env.EMAIL_FROM || '"Khóa Lập Trình" <noreply@khoalaptrinh.vn>',
      to:      options.to,
      subject: options.subject,
      html:    options.html,
    });
    logger.info(`[mailer] Đã gửi tới ${options.to}: ${options.subject}`);
    return true;
  } catch (err: any) {
    logger.error(`[mailer] Gửi thất bại tới ${options.to}: ${err.message}`);
    return false;
  }
};

const year = () => new Date().getFullYear();

const baseLayout = (headerBg: string, title: string, body: string): string => `<!DOCTYPE html>
<html lang="vi">
<head><meta charset="UTF-8"><title>${title}</title></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 0;">
<tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
<tr><td style="background:${headerBg};padding:32px 40px;text-align:center;">
  <h1 style="margin:0;color:#fff;font-size:24px;font-weight:700;">${title}</h1>
  <p style="margin:8px 0 0;color:rgba(255,255,255,0.8);font-size:14px;">Khóa Lập Trình</p>
</td></tr>
<tr><td style="padding:40px;">${body}</td></tr>
<tr><td style="background:#fafafa;padding:20px 40px;text-align:center;border-top:1px solid #f0f0f0;">
  <p style="margin:0;color:#bbb;font-size:12px;">&#169; ${year()} Khóa Lập Trình.</p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;

export const resetPasswordTemplate = (resetUrl: string, fullName?: string): string => {
  const greeting = fullName ? `Xin ch&#224;o <strong>${fullName}</strong>,` : 'Xin ch&#224;o,';
  const body = `
    <p style="margin:0 0 16px;color:#333;font-size:16px;">${greeting}</p>
    <p style="margin:0 0 24px;color:#555;font-size:15px;line-height:1.6;">
      Ch&#250;ng t&#244;i nh&#7853;n &#273;&#432;&#7907;c y&#234;u c&#7847;u &#273;&#7863;t l&#7841;i m&#7853;t kh&#7849;u.
      Link c&#243; hi&#7879;u l&#7921;c trong <strong>1 gi&#7901;</strong>.
    </p>
    <div style="text-align:center;margin:32px 0;">
      <a href="${resetUrl}" style="display:inline-block;background:#1677ff;color:#fff;text-decoration:none;padding:14px 36px;border-radius:8px;font-size:16px;font-weight:600;">
        &#272;&#7863;t l&#7841;i m&#7853;t kh&#7849;u
      </a>
    </div>
    <p style="margin:0 0 8px;color:#888;font-size:13px;">
      Ho&#7863;c copy link: <a href="${resetUrl}" style="color:#1677ff;">${resetUrl}</a>
    </p>
    <hr style="border:none;border-top:1px solid #f0f0f0;margin:24px 0;">
    <p style="margin:0;color:#aaa;font-size:13px;">
      N&#7871;u b&#7841;n kh&#244;ng y&#234;u c&#7847;u, h&#227;y b&#7887; qua email n&#224;y.
    </p>`;
  return baseLayout('linear-gradient(135deg,#1677ff,#0958d9)', '&#128274; &#272;&#7863;t l&#7841;i m&#7853;t kh&#7849;u', body);
};

export const newStudentAccountTemplate = (
  fullName: string,
  email: string,
  password: string,
  loginUrl: string,
  courseName?: string,
): string => {
  const courseNote = courseName
    ? `C&#7843;m &#417;n b&#7841;n &#273;&#227; &#273;&#259;ng k&#253; kh&#243;a h&#7885;c <strong>${courseName}</strong>. `
    : '';
  const body = `
    <p style="margin:0 0 16px;color:#333;font-size:16px;">Xin ch&#224;o <strong>${fullName}</strong>,</p>
    <p style="margin:0 0 24px;color:#555;font-size:15px;line-height:1.6;">
      ${courseNote}Admin &#273;&#227; t&#7841;o t&#224;i kho&#7843;n h&#7885;c t&#7853;p cho b&#7841;n:
    </p>
    <div style="background:#f8faff;border:1px solid #dbeafe;border-radius:8px;padding:20px 24px;margin:0 0 24px;">
      <p style="margin:0 0 10px;color:#333;font-size:15px;">&#128231; <strong>Email:</strong> ${email}</p>
      <p style="margin:0;color:#333;font-size:15px;">&#128273; <strong>M&#7853;t kh&#7849;u:</strong>
        <code style="background:#e0e7ff;padding:2px 8px;border-radius:4px;font-size:15px;">${password}</code>
      </p>
    </div>
    <p style="margin:0 0 24px;color:#e74c3c;font-size:14px;">
      &#9888;&#65039; Vui l&#242;ng &#273;&#7893;i m&#7853;t kh&#7849;u sau khi &#273;&#259;ng nh&#7853;p l&#7847;n &#273;&#7847;u.
    </p>
    <div style="text-align:center;margin:32px 0;">
      <a href="${loginUrl}" style="display:inline-block;background:#1677ff;color:#fff;text-decoration:none;padding:14px 36px;border-radius:8px;font-size:16px;font-weight:600;">
        &#272;&#259;ng nh&#7853;p ngay
      </a>
    </div>
    <hr style="border:none;border-top:1px solid #f0f0f0;margin:24px 0;">
    <p style="margin:0;color:#aaa;font-size:13px;">
      N&#7871;u c&#243; th&#7855;c m&#7855;c, li&#234;n h&#7879; qua email ho&#7863;c Zalo.
    </p>`;
  return baseLayout('linear-gradient(135deg,#0f172a,#1e3a5f)', '&#127891; T&#224;i kho&#7843;n h&#7885;c t&#7853;p c&#7911;a b&#7841;n', body);
};
