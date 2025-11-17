/**
 * Template de Email - Contraseña Restablecida Exitosamente
 *
 * Email de confirmación enviado después de que el usuario cambia su contraseña.
 * Incluye información de seguridad y acciones a tomar si no fue él.
 *
 * Compatible con: Gmail, Outlook, Apple Mail, Yahoo, etc.
 */

function passwordResetSuccessTemplate({ name, resetDate, ipAddress }) {
  const formattedDate = new Date(resetDate).toLocaleString('es-AR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Argentina/Buenos_Aires'
  });

  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Contraseña Actualizada - GymPoint</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f3f4f6;">
        <tr>
          <td style="padding: 40px 20px;">
            <!-- Main Container -->
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">

              <!-- Header -->
              <tr>
                <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #10B981 0%, #059669 100%); border-radius: 12px 12px 0 0;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">✅ GymPoint</h1>
                  <p style="margin: 10px 0 0; color: #D1FAE5; font-size: 14px;">Confirmación de seguridad</p>
                </td>
              </tr>

              <!-- Content -->
              <tr>
                <td style="padding: 40px;">
                  <h2 style="margin: 0 0 20px; color: #1F2937; font-size: 24px; font-weight: 600;">Hola ${name}</h2>

                  <p style="margin: 0 0 20px; color: #4B5563; font-size: 16px; line-height: 1.6;">
                    Tu contraseña de GymPoint ha sido actualizada exitosamente.
                  </p>

                  <!-- Success Icon -->
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                    <tr>
                      <td style="text-align: center; padding: 20px 0 30px;">
                        <div style="display: inline-block; width: 80px; height: 80px; background: linear-gradient(135deg, #10B981 0%, #059669 100%); border-radius: 50%; text-align: center; line-height: 80px; font-size: 40px;">
                          ✓
                        </div>
                      </td>
                    </tr>
                  </table>

                  <!-- Details -->
                  <div style="margin: 0 0 30px; padding: 20px; background-color: #F3F4F6; border-radius: 8px;">
                    <p style="margin: 0 0 10px; color: #6B7280; font-size: 14px;">
                      <strong style="color: #1F2937;">Fecha del cambio:</strong><br>
                      ${formattedDate}
                    </p>
                    ${ipAddress ? `
                      <p style="margin: 10px 0 0; color: #6B7280; font-size: 14px;">
                        <strong style="color: #1F2937;">Dirección IP:</strong><br>
                        ${ipAddress}
                      </p>
                    ` : ''}
                  </div>

                  <!-- Security Alert -->
                  <div style="margin: 30px 0; padding: 20px; background-color: #FEE2E2; border-left: 4px solid #DC2626; border-radius: 6px;">
                    <p style="margin: 0 0 10px; color: #991B1B; font-size: 14px; font-weight: 600;">
                      🚨 ¿No fuiste tú?
                    </p>
                    <p style="margin: 0; color: #991B1B; font-size: 14px; line-height: 1.6;">
                      Si no realizaste este cambio, tu cuenta podría estar comprometida. Por favor:
                    </p>
                    <ul style="margin: 10px 0 0; padding-left: 20px; color: #991B1B; font-size: 14px; line-height: 1.6;">
                      <li>Contacta inmediatamente a soporte</li>
                      <li>Revisa la actividad reciente de tu cuenta</li>
                      <li>Cambia tu contraseña nuevamente</li>
                    </ul>
                  </div>

                  <!-- Security Tips -->
                  <div style="margin: 30px 0; padding: 20px; background-color: #EFF6FF; border-left: 4px solid #3B82F6; border-radius: 6px;">
                    <p style="margin: 0 0 10px; color: #1E40AF; font-size: 14px; font-weight: 600;">
                      💡 Consejos de seguridad:
                    </p>
                    <ul style="margin: 0; padding-left: 20px; color: #1E40AF; font-size: 14px; line-height: 1.6;">
                      <li>Usa una contraseña única y fuerte</li>
                      <li>No compartas tu contraseña con nadie</li>
                      <li>Habilita la autenticación de dos factores si está disponible</li>
                    </ul>
                  </div>

                  <p style="margin: 20px 0 0; color: #6B7280; font-size: 14px; line-height: 1.6;">
                    Todas tus sesiones activas en otros dispositivos han sido cerradas automáticamente por seguridad.
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

module.exports = { passwordResetSuccessTemplate };
