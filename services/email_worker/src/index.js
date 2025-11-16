const amqplib = require('amqplib');
const nodemailer = require('nodemailer');

const amqpUrl = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
const EMAIL_QUEUE = 'email_queue';

// Parámetros SMTP (MailHog por defecto, Gmail si hay credenciales)
const env = {
  host: process.env.SMTP_HOST || 'smtp',
  port: parseInt(process.env.SMTP_PORT || '1025', 10),
  secure: String(process.env.SMTP_SECURE || 'false').toLowerCase() === 'true',
  secureExplicit: typeof process.env.SMTP_SECURE !== 'undefined',
  provider: String(process.env.SMTP_PROVIDER || '').toLowerCase(),
  user: process.env.SMTP_USER || '',
  pass: process.env.SMTP_PASS || '',
  from: process.env.SMTP_FROM || '',
};

function resolveSmtp() {
  let { host, port, secure } = env;
  let from = env.from || env.user || 'no-reply@ledger.local';

  const hasCreds = env.user && env.pass;
  const wantsGmail = env.provider === 'gmail' || (env.user && env.user.endsWith('@gmail.com'));

  if (wantsGmail && hasCreds) {
    // Configuración robusta para Gmail (ignora combinaciones inválidas)
    host = 'smtp.gmail.com';
    const userPort = Number(process.env.SMTP_PORT);
    if (userPort === 465 || userPort === 587) {
      port = userPort;
    } else {
      port = 465; // default seguro
    }
    secure = port === 465; // 465 = SSL, 587 = STARTTLS
    from = env.from || env.user;
  } else if (wantsGmail && !hasCreds) {
    // Fallback seguro a MailHog cuando no hay credenciales
    host = 'smtp';
    port = 1025;
    secure = false;
  }

  const options = { host, port, secure };
  if (host.includes('smtp.gmail.com') && port === 587) {
    options.requireTLS = true;
  }
  if (hasCreds) options.auth = { user: env.user, pass: env.pass };

  return { options, from };
}

async function main() {
  console.log('[email_worker] iniciando...');
  const conn = await amqplib.connect(amqpUrl);
  const ch = await conn.createChannel();
  await ch.assertQueue(EMAIL_QUEUE, { durable: true });
  const { options, from: defaultFrom } = resolveSmtp();
  const transport = nodemailer.createTransport(options);
  console.log('[email_worker] SMTP conectado a', options.host, 'puerto', options.port, 'secure=', options.secure);
  await ch.prefetch(5);
  console.log('[email_worker] Esperando mensajes en', EMAIL_QUEUE);

  ch.consume(EMAIL_QUEUE, async (msg) => {
    if (!msg) return;
    try {
      const payload = JSON.parse(msg.content.toString());
      const mail = {
        from: defaultFrom,
        to: payload.to,
        subject: payload.subject || `Notificación de transacción ${payload.tx_id}`,
        text: payload.body || JSON.stringify(payload, null, 2)
      };
      await transport.sendMail(mail);
      console.log(`[email_worker] Enviado correo a ${mail.to} (tx_id=${payload.tx_id})`);
      ch.ack(msg);
    } catch (err) {
      console.error('[email_worker] Error procesando email:', err);
      ch.nack(msg, false, true);
    }
  }, { noAck: false });
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });