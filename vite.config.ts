import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import nodemailer from 'nodemailer';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      tailwindcss(),
      react(),
      {
        name: 'qa-email-api',
        configureServer(server) {
          server.middlewares.use('/api/send-qa-email', async (req, res) => {
            if (req.method !== 'POST') {
              res.statusCode = 405;
              res.end(JSON.stringify({ error: 'Method Not Allowed' }));
              return;
            }

            let body = '';
            req.on('data', (chunk) => {
              body += chunk;
            });

            req.on('end', async () => {
              try {
                const data = JSON.parse(body || '{}');
                const recipientEmail =
                  data.to ||
                  env.QA_MANAGER_EMAIL ||
                  env.VITE_QA_MANAGER_EMAIL ||
                  'reginevertex1201@gmail.com';
                const subject = data.subject || 'VTC Daily QA Tasks Digest';
                const html = data.html || '<p>No content provided</p>';

                const rawUser = data.smtpUser || env.SMTP_USER || env.VITE_SMTP_USER || 'erwinrillorta0830@gmail.com';
                const rawPass = data.smtpPass || env.SMTP_PASS || 'nmgmpuxsnagcjycx';

                const smtpUser = String(rawUser).trim();
                const smtpPass = String(rawPass).replace(/\s+/g, '');

                console.log(`[SMTP Dispatch] Attempting Gmail dispatch to ${recipientEmail} from ${smtpUser}...`);

                // Use Gmail service configuration which handles SSL/TLS ports automatically
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

                console.log(`[SMTP Success] Email delivered. MessageID: ${info.messageId}`);

                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(
                  JSON.stringify({
                    success: true,
                    messageId: info.messageId,
                    recipient: recipientEmail
                  })
                );
              } catch (err: any) {
                console.error('[SMTP Error] Failed to send email:', err);
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(
                  JSON.stringify({
                    success: false,
                    error: err?.message || 'Failed to dispatch email via SMTP'
                  })
                );
              }
            });
          });
        }
      }
    ],
    server: {
      port: 3000,
      open: true
    }
  };
});

