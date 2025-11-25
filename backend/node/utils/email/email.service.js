const nodemailer = require('nodemailer');
const { emailVerificationTemplate } = require('./templates/verification.template');
const { welcomeTemplate } = require('./templates/welcome.template');
const { passwordResetTemplate } = require('./templates/password-reset.template');
const { passwordResetSuccessTemplate } = require('./templates/password-reset-success.template');

/**
 * Servicio de Email - Gestión de envío de correos
 *
 * IMPORTANTE: Este servicio usa SMTP directo sin servicios de terceros pagos.
 * Configurar las credenciales SMTP en .env según el entorno:
 *
 * Desarrollo:
 * - Usar Mailtrap.io (free, 500 emails/mes)
 * - O Gmail con App Password (menos seguro)
 *
 * Producción:
 * - Usar credenciales SMTP del servidor Plesk
 * - Configurar SPF/DKIM/DMARC en DNS para mejor entregabilidad
 */

class EmailService {
  constructor() {
    this.transporter = null;
    this.initialized = false;
    this.initializeTransporter();
  }

  /**
   * Inicializa el transporte SMTP con las credenciales del .env
   */
  initializeTransporter() {
    try {
      const config = {
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: process.env.SMTP_SECURE === 'true', // true para 465, false para 587
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
        // Configuraciones adicionales para mejorar la entregabilidad
        pool: true, // Usar pooling para múltiples emails
        maxConnections: 5,
        maxMessages: 100,
      };

      this.transporter = nodemailer.createTransport(config);

      // Verificar la conexión SMTP al iniciar
      this.transporter.verify((error, success) => {
        if (error) {
          console.error('[EmailService] Error verificando conexión SMTP:', error.message);
          console.warn('[EmailService] Los emails NO se enviarán hasta resolver el error SMTP');
        } else {
          console.log('[EmailService] Conexión SMTP verificada correctamente ✓');
          this.initialized = true;
        }
      });
    } catch (error) {
      console.error('[EmailService] Error inicializando transporter:', error);
      this.initialized = false;
    }
  }

  /**
   * Envía un email genérico
   *
   * @param {Object} options - Opciones del email
   * @param {string} options.to - Email destinatario
   * @param {string} options.subject - Asunto del email
   * @param {string} options.html - Contenido HTML del email
   * @param {string} [options.text] - Contenido texto plano (fallback)
   * @returns {Promise<Object>} Información del envío
   */
  async sendEmail({ to, subject, html, text }) {
    if (!this.initialized || !this.transporter) {
      console.error('[EmailService] SMTP no inicializado, no se puede enviar email');
      // En desarrollo, loguear y continuar sin romper la app
      if (process.env.NODE_ENV !== 'production') {
        console.warn(`[EmailService] Simulando envío de email a: ${to}`);
        console.log(`[EmailService] Asunto: ${subject}`);
        return { messageId: 'simulated-in-development' };
      }
      throw new Error('Servicio de email no disponible');
    }

    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'GymPoint <noreply@gympoint.app>',
        to,
        subject,
        html,
        text: text || this.stripHtml(html), // Fallback a texto plano
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log(`[EmailService] Email enviado exitosamente a ${to}. MessageId: ${info.messageId}`);
      return info;
    } catch (error) {
      console.error('[EmailService] Error enviando email:', error);
      throw error;
    }
  }

  /**
   * Envía email de verificación de cuenta
   *
   * @param {Object} options
   * @param {string} options.email - Email del usuario
   * @param {string} options.name - Nombre del usuario
   * @param {string} options.token - Token de verificación UUID
   * @returns {Promise<Object>}
   */
  async sendVerificationEmail({ email, name, token }) {
    const verificationUrl = `${process.env.EMAIL_VERIFICATION_URL}?token=${token}`;
    const expirationHours = 24;

    const html = emailVerificationTemplate({
      name,
      verificationUrl,
      expirationHours,
    });

    return this.sendEmail({
      to: email,
      subject: 'Confirma tu cuenta en GymPoint',
      html,
    });
  }

  /**
   * Envía email de bienvenida (después de verificar cuenta)
   *
   * @param {Object} options
   * @param {string} options.email - Email del usuario
   * @param {string} options.name - Nombre del usuario
   * @returns {Promise<Object>}
   */
  async sendWelcomeEmail({ email, name }) {
    const html = welcomeTemplate({ name });

    return this.sendEmail({
      to: email,
      subject: '¡Bienvenido a GymPoint! 🎉',
      html,
    });
  }

  /**
   * Envía email de restablecimiento de contraseña
   *
   * @param {Object} options
   * @param {string} options.email - Email del usuario
   * @param {string} options.name - Nombre del usuario
   * @param {string} options.token - Token de reset UUID
   * @returns {Promise<Object>}
   */
  async sendPasswordResetEmail({ email, name, token }) {
    const resetUrl = `${process.env.PASSWORD_RESET_URL}?token=${token}`;
    const expirationMinutes = 60; // 1 hora

    const html = passwordResetTemplate({
      name,
      resetUrl,
      expirationMinutes,
    });

    return this.sendEmail({
      to: email,
      subject: 'Restablecer contraseña - GymPoint',
      html,
    });
  }

  /**
   * Envía email de confirmación de contraseña restablecida
   *
   * @param {Object} options
   * @param {string} options.email - Email del usuario
   * @param {string} options.name - Nombre del usuario
   * @param {string} [options.ipAddress] - IP desde donde se cambió (opcional)
   * @returns {Promise<Object>}
   */
  async sendPasswordResetSuccessEmail({ email, name, ipAddress }) {
    const resetDate = new Date();

    const html = passwordResetSuccessTemplate({
      name,
      resetDate,
      ipAddress: ipAddress || null,
    });

    return this.sendEmail({
      to: email,
      subject: 'Contraseña actualizada - GymPoint',
      html,
    });
  }

  /**
   * Strip HTML tags para crear versión texto plano
   * @param {string} html
   * @returns {string}
   */
  stripHtml(html) {
    return html
      .replace(/<[^>]*>/g, '') // Remover tags HTML
      .replace(/&nbsp;/g, ' ') // Reemplazar nbsp
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/\s+/g, ' ') // Colapsar espacios múltiples
      .trim();
  }

  /**
   * Cerrar el transporter (útil para tests o shutdown graceful)
   */
  async close() {
    if (this.transporter) {
      this.transporter.close();
      console.log('[EmailService] Transporter cerrado');
    }
  }
}

// Exportar singleton
module.exports = new EmailService();
