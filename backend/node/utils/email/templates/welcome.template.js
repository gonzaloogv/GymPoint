/**
 * Plantilla de Email - Bienvenida (Post-Verificación)
 *
 * Se envía después de que el usuario verifique su email exitosamente.
 * Diseño responsive y compatible con todos los clientes de email.
 */

const welcomeTemplate = ({ name }) => {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bienvenido a GymPoint</title>
  <style>
    body, table, td, a {
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }
    table, td {
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
    }
    img {
      -ms-interpolation-mode: bicubic;
      border: 0;
      height: auto;
      line-height: 100%;
      outline: none;
      text-decoration: none;
    }

    body {
      margin: 0;
      padding: 0;
      width: 100% !important;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #f3f4f6;
    }

    .email-container {
      max-width: 600px;
      margin: 0 auto;
    }

    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 40px 20px;
      text-align: center;
    }

    .logo {
      font-size: 32px;
      font-weight: bold;
      color: #ffffff;
      margin: 0;
    }

    .content {
      background-color: #ffffff;
      padding: 40px 30px;
    }

    .greeting {
      font-size: 24px;
      font-weight: 600;
      color: #1f2937;
      margin: 0 0 20px 0;
    }

    .text {
      font-size: 16px;
      line-height: 1.6;
      color: #4b5563;
      margin: 0 0 20px 0;
    }

    .feature-box {
      background-color: #f9fafb;
      border-left: 4px solid #667eea;
      padding: 20px;
      margin: 20px 0;
      border-radius: 4px;
    }

    .feature-title {
      font-size: 18px;
      font-weight: 600;
      color: #1f2937;
      margin: 0 0 10px 0;
    }

    .feature-text {
      font-size: 14px;
      color: #6b7280;
      margin: 0;
    }

    .button-container {
      text-align: center;
      margin: 30px 0;
    }

    .button {
      display: inline-block;
      padding: 16px 40px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
    }

    .footer {
      background-color: #f9fafb;
      padding: 30px 20px;
      text-align: center;
    }

    .footer-text {
      font-size: 14px;
      color: #6b7280;
      margin: 5px 0;
    }

    .footer-link {
      color: #667eea;
      text-decoration: none;
    }

    @media only screen and (max-width: 600px) {
      .content {
        padding: 30px 20px !important;
      }

      .greeting {
        font-size: 20px !important;
      }

      .button {
        display: block !important;
        width: 100% !important;
        box-sizing: border-box;
      }
    }
  </style>
</head>
<body>
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f3f4f6;">
    <tr>
      <td style="padding: 20px 0;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" class="email-container" width="100%">

          <!-- Header -->
          <tr>
            <td class="header">
              <h1 class="logo">GymPoint</h1>
            </td>
          </tr>

          <!-- Contenido Principal -->
          <tr>
            <td class="content">
              <h2 class="greeting">¡Bienvenido/a, ${name}! 🎉</h2>

              <p class="text">
                Tu cuenta ha sido verificada exitosamente. Ahora eres parte de la comunidad <strong>GymPoint</strong>,
                donde miles de usuarios alcanzan sus objetivos fitness cada día.
              </p>

              <div class="feature-box">
                <h3 class="feature-title">🏋️ Entrena y gana recompensas</h3>
                <p class="feature-text">
                  Cada asistencia al gym y rutina completada te da tokens que puedes canjear por beneficios exclusivos.
                </p>
              </div>

              <div class="feature-box">
                <h3 class="feature-title">📍 Encuentra gimnasios cercanos</h3>
                <p class="feature-text">
                  Descubre gimnasios afiliados cerca de ti y registra tu asistencia con un solo tap.
                </p>
              </div>

              <div class="feature-box">
                <h3 class="feature-title">📊 Sigue tu progreso</h3>
                <p class="feature-text">
                  Estadísticas detalladas de tus entrenamientos, racha de asistencia y logros desbloqueados.
                </p>
              </div>

              <p class="text">
                ¿Listo para comenzar tu primera sesión? Abre la app y empieza a entrenar hoy mismo.
              </p>

              <div class="button-container">
                <a href="gympoint://home" class="button">
                  Abrir GymPoint
                </a>
              </div>

              <p class="text" style="text-align: center; color: #9ca3af; font-size: 14px;">
                ¿Necesitas ayuda para empezar? Visita nuestro
                <a href="https://gympoint.app/ayuda" style="color: #667eea;">Centro de Ayuda</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td class="footer">
              <p class="footer-text">
                <strong>GymPoint</strong> - Tu compañero de entrenamiento
              </p>
              <p class="footer-text">
                ¿Tienes dudas? <a href="mailto:soporte@gympoint.app" class="footer-link">Contáctanos</a>
              </p>
              <p class="footer-text" style="margin-top: 20px;">
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
  `.trim();
};

module.exports = { welcomeTemplate };
