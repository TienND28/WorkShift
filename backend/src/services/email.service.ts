import nodemailer from "nodemailer";
import { ENV, isDevelopment } from "../config/env.js";
import { logger } from "../common/logger/logger.js";

const hasSmtp = Boolean(ENV.smtpHost && ENV.smtpUser && ENV.smtpPass);

const transporter = hasSmtp
  ? nodemailer.createTransport({
      host: ENV.smtpHost,
      port: ENV.smtpPort,
      secure: ENV.smtpSecure,
      auth: {
        user: ENV.smtpUser,
        pass: ENV.smtpPass,
      },
    })
  : null;

export async function sendLoginEmail(email: string, magicLink: string) {
  const subject = "Đăng nhập WorkShift";
  const text = [
    "Bạn vừa yêu cầu đăng nhập WorkShift.",
    "",
    "Nhấn vào liên kết sau (có hiệu lực 15 phút):",
    magicLink,
    "",
    "Nếu bạn không yêu cầu, hãy bỏ qua email này.",
  ].join("\n");

  const html = `
    <p>Bạn vừa yêu cầu đăng nhập <strong>WorkShift</strong>.</p>
    <p><a href="${magicLink}" style="display:inline-block;padding:12px 24px;background:#2563eb;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;">Đăng nhập ngay</a></p>
    <p style="color:#666;font-size:13px;">Liên kết có hiệu lực 15 phút. Nếu nút không hoạt động, copy URL:<br/><a href="${magicLink}">${magicLink}</a></p>
    <p style="color:#999;font-size:12px;">Nếu bạn không yêu cầu, hãy bỏ qua email này.</p>
  `;

  if (!transporter) {
    logger.info(
      { email, magicLink },
      isDevelopment()
        ? "[DEV] Email login link (SMTP chưa cấu hình)"
        : "Email login link skipped — SMTP not configured",
    );
    return;
  }

  await transporter.sendMail({
    from: ENV.emailFrom,
    to: email,
    subject,
    text,
    html,
  });
}

export async function sendEmployerEmailOtp(email: string, otp: string) {
  const subject = "Mã xác thực email WorkShift";
  const text = [
    "Bạn đang xác thực email liên hệ nhà tuyển dụng trên WorkShift.",
    "",
    `Mã xác thực: ${otp}`,
    "",
    "Mã có hiệu lực 10 phút. Nếu bạn không yêu cầu, hãy bỏ qua email này.",
  ].join("\n");

  const html = `
    <p>Bạn đang xác thực <strong>email liên hệ nhà tuyển dụng</strong> trên WorkShift.</p>
    <p style="font-size:28px;font-weight:700;letter-spacing:6px;margin:24px 0;">${otp}</p>
    <p style="color:#666;font-size:13px;">Mã có hiệu lực 10 phút. Nếu bạn không yêu cầu, hãy bỏ qua email này.</p>
  `;

  if (!transporter) {
    logger.info(
      { email, otp },
      isDevelopment()
        ? "[DEV] Employer email OTP (SMTP chưa cấu hình)"
        : "Employer email OTP skipped — SMTP not configured",
    );
    return;
  }

  await transporter.sendMail({
    from: ENV.emailFrom,
    to: email,
    subject,
    text,
    html,
  });
}
