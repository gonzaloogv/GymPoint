/**
 * Template de Email - Restablecer Contraseña
 *
 * Email enviado cuando el usuario solicita restablecer su contraseña.
 * Incluye enlace seguro con token UUID válido por 1 hora.
 *
 * Compatible con: Gmail, Outlook, Apple Mail, Yahoo, etc.
 */

function passwordResetTemplate({ name, resetUrl, expirationMinutes = 60 }) {
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Restablecer Contraseña - GymPoint</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f3f4f6;">
        <tr>
          <td style="padding: 40px 20px;">
            <!-- Main Container -->
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">

              <!-- Header -->
              <tr>
                <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #635BFF 0%, #4F46E5 100%); border-radius: 12px 12px 0 0;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">🔐 GymPoint</h1>
                  <p style="margin: 10px 0 0; color: #E0E7FF; font-size: 14px;">Seguridad de tu cuenta</p>
                </td>
              </tr>

              <!-- Content -->
              <tr>
                <td style="padding: 40px;">
                  <h2 style="margin: 0 0 20px; color: #1F2937; font-size: 24px; font-weight: 600;">Hola ${name}</h2>

                  <p style="margin: 0 0 20px; color: #4B5563; font-size: 16px; line-height: 1.6;">
                    Recibimos una solicitud para restablecer la contraseña de tu cuenta en GymPoint.
                  </p>

                  <p style="margin: 0 0 30px; color: #4B5563; font-size: 16px; line-height: 1.6;">
                    Haz click en el botón de abajo para crear una nueva contraseña:
                  </p>

                  <!-- CTA Button -->
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                    <tr>
                      <td style="text-align: center; padding-bottom: 30px;">
                        <a href="${resetUrl}"
                           style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #635BFF 0%, #4F46E5 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(99, 91, 255, 0.25);">
                          Restablecer Contraseña
                        </a>
                      </td>
                    </tr>
                  </table>

                  <!-- Alternative Link -->
                  <p style="margin: 0 0 20px; color: #6B7280; font-size: 14px; line-height: 1.6;">
                    Si el botón no funciona, copia y pega este enlace en tu navegador:
                  </p>

                  <p style="margin: 0 0 30px; padding: 12px; background-color: #F3F4F6; border-radius: 6px; word-break: break-all; font-size: 14px; color: #4B5563;">
                    ${resetUrl}
                  </p>

                  <!-- Security Notice -->
                  <div style="margin: 30px 0; padding: 20px; background-color: #FEF3C7; border-left: 4px solid #F59E0B; border-radius: 6px;">
                    <p style="margin: 0 0 10px; color: #92400E; font-size: 14px; font-weight: 600;">
                      ⚠️ Importante:
                    </p>
                    <ul style="margin: 0; padding-left: 20px; color: #92400E; font-size: 14px; line-height: 1.6;">
                      <li>Este enlace expira en <strong>${expirationMinutes} minutos</strong></li>
                      <li>Solo puede usarse una vez</li>
                      <li>Si no solicitaste esto, ignora este email</li>
                    </ul>
                  </div>

                  <p style="margin: 20px 0 0; color: #6B7280; font-size: 14px; line-height: 1.6;">
                    Si no solicitaste restablecer tu contraseña, puedes ignorar este email de forma segura. Tu contraseña actual seguirá activa.
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="padding: 30px 40px; background-color: #F9FAFB; border-radius: 0 0 12px 12px; text-align: center;">
                  <p style="margin: 0 0 10px; color: #6B7280; font-size: 14px;">
                    ¿Necesitas ayuda? Contáctanos en
                    <a href="mailto:soporte@gympoint.app" style="color: #635BFF; text-decoration: none; font-weight: 600;">soporte@gympoint.app</a>
                  </p>

                  <p style="margin: 10px 0 0; color: #9CA3AF; font-size: 12px;">
                    © ${new Date().getFullYear()} GymPoint. Todos los derechos reservados.
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

module.exports = { passwordResetTemplate };
