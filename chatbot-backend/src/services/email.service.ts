import nodemailer from 'nodemailer';

const SMTP_HOST = process.env['SMTP_HOST'] || '';
const SMTP_PORT = parseInt(process.env['SMTP_PORT'] || '587', 10);
const SMTP_USER = process.env['SMTP_USER'] || '';
const SMTP_PASS = process.env['SMTP_PASS'] || '';
const SMTP_FROM = process.env['SMTP_FROM'] || SMTP_USER;
const FRONTEND_URL = (process.env['FRONTEND_URL'] || 'http://localhost:3000').replace(/\/$/, '');

function createTransport() {
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    return null;
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
}

const transporter = createTransport();

async function sendMail(to: string, subject: string, html: string) {
  if (!transporter) {
    console.warn(`[EmailService] SMTP não configurado. Email para ${to} não enviado. Assunto: ${subject}`);
    return;
  }

  await transporter.sendMail({ from: SMTP_FROM, to, subject, html });
}

export class EmailService {
  async sendVerificationEmail(email: string, token: string, userName: string) {
    const link = `${FRONTEND_URL}/api/auth/verify-email?token=${token}`;

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:24px;">
        <h2 style="color:#333;">Olá, ${userName}!</h2>
        <p>Obrigado por se cadastrar. Para ativar sua conta, confirme seu email clicando no botão abaixo:</p>
        <div style="text-align:center;margin:32px 0;">
          <a href="${link}"
             style="background:#6C63FF;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block;">
            Confirmar meu email
          </a>
        </div>
        <p style="color:#888;font-size:13px;">
          Se o botão não funcionar, copie e cole este link no navegador:<br/>
          <a href="${link}">${link}</a>
        </p>
        <p style="color:#888;font-size:13px;">Este link expira em 24 horas.</p>
      </div>
    `;

    await sendMail(email, 'Confirme seu email — Contexta', html);
  }

  async sendPasswordResetEmail(email: string, token: string, userName: string) {
    const link = `${FRONTEND_URL}/auth/reset-password?token=${token}`;

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:24px;">
        <h2 style="color:#333;">Olá, ${userName}!</h2>
        <p>Recebemos uma solicitação para redefinir sua senha. Clique no botão abaixo para criar uma nova senha:</p>
        <div style="text-align:center;margin:32px 0;">
          <a href="${link}"
             style="background:#6C63FF;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block;">
            Redefinir minha senha
          </a>
        </div>
        <p style="color:#888;font-size:13px;">
          Se o botão não funcionar, copie e cole este link no navegador:<br/>
          <a href="${link}">${link}</a>
        </p>
        <p style="color:#888;font-size:13px;">Este link expira em 1 hora. Se você não solicitou a redefinição, ignore este email.</p>
      </div>
    `;

    await sendMail(email, 'Redefinição de senha — Contexta', html);
  }
}
