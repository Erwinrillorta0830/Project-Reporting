import nodemailer from 'nodemailer';

export default async function handler(req: any, res: any) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const data = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};

    const recipientEmail =
      data.to ||
      process.env.QA_MANAGER_EMAIL ||
      process.env.VITE_QA_MANAGER_EMAIL ||
      'reginevertex1201@gmail.com';
    const subject = data.subject || 'VTC Daily QA Tasks Digest';
    const html = data.html || '<p>No content provided</p>';

    const rawUser =
      data.smtpUser ||
      process.env.SMTP_USER ||
      process.env.VITE_SMTP_USER ||
      'erwinrillorta0830@gmail.com';
    const rawPass =
      data.smtpPass ||
      process.env.SMTP_PASS ||
      '';

    const smtpUser = String(rawUser).trim();
    const smtpPass = String(rawPass).replace(/\s+/g, '');

    if (!smtpPass) {
      return res.status(500).json({
        success: false,
        error: 'SMTP_PASS environment variable is missing on Vercel.'
      });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: smtpUser,
        pass: smtpPass
      }
    });

    const info = await transporter.sendMail({
      from: `"Vertex Technologies QA System" <${smtpUser}>`,
      to: recipientEmail,
      subject: subject,
      html: html
    });

    return res.status(200).json({
      success: true,
      messageId: info.messageId,
      recipient: recipientEmail
    });
  } catch (err: any) {
    console.error('[SMTP Error] Failed to send email via Vercel Function:', err);
    return res.status(500).json({
      success: false,
      error: err?.message || 'Failed to dispatch email via SMTP'
    });
  }
}
