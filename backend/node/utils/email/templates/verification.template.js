/**
 * Plantilla de Email - Verificación de Cuenta
 *
 * Diseño responsive compatible con:
 * - Gmail (Web, iOS, Android)
 * - Outlook (Web, Desktop, iOS, Android)
 * - Apple Mail (iOS, macOS)
 * - Otros clientes populares
 *
 * IMPORTANTE: No usar CSS complejo (flexbox, grid) ya que muchos
 * clientes de email no los soportan. Usar tablas para layout.
 */

const emailVerificationTemplate = ({ name, verificationUrl, expirationHours = 24 }) => {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirma tu cuenta - GymPoint</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    /* Reset básico para clients de email */
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

    /* Estilos generales */
    body {
      margin: 0;
      padding: 0;
      width: 100% !important;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #f3f4f6;
    }

    /* Contenedor principal */
    .email-container {
      max-width: 600px;
      margin: 0 auto;
    }

    /* Header */
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
      text-decoration: none;
    }

    /* Contenido */
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

    /* Botón CTA */
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
      transition: transform 0.2s;
    }

    .button:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }

    /* Link alternativo */
    .alt-link {
      font-size: 14px;
      color: #6b7280;
      margin: 20px 0;
      word-break: break-all;
    }

    .alt-link a {
      color: #667eea;
      text-decoration: underline;
    }

    /* Advertencia */
    .warning {
      background-color: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 16px;
      margin: 20px 0;
      border-radius: 4px;
    }

    .warning-text {
      font-size: 14px;
      color: #92400e;
      margin: 0;
    }

    /* Footer */
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

    /* Responsive */
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
              <h2 class="greeting">¡Hola ${name}!</h2>

              <p class="text">
                Gracias por registrarte en <strong>GymPoint</strong>, tu compañero de entrenamiento definitivo.
                Estamos emocionados de tenerte en nuestra comunidad fitness.
              </p>

              <p class="text">
                Para comenzar a usar tu cuenta, necesitamos que confirmes tu dirección de email.
                Haz clic en el botón de abajo para verificar tu cuenta:
              </p>

              <div class="button-container">
                <a href="${verificationUrl}" class="button">
                  Confirmar mi cuenta
                </a>
              </div>

              <p class="alt-link">
                Si el botón no funciona, copia y pega este enlace en tu navegador:<br>
                <a href="${verificationUrl}">${verificationUrl}</a>
              </p>

              <div class="warning">
                <p class="warning-text">
                  ⏰ <strong>Este enlace expirará en ${expirationHours} horas.</strong><br>
                  Si no verificas tu cuenta en este tiempo, deberás solicitar un nuevo enlace desde la aplicación.
                </p>
              </div>

              <p class="text">
                Una vez verificado tu email, podrás:
              </p>

              <ul class="text" style="line-height: 1.8;">
                <li>Acceder a tu perfil personalizado</li>
                <li>Registrar tus entrenamientos y rutinas</li>
                <li>Encontrar gimnasios cercanos</li>
                <li>Acumular tokens y ganar recompensas</li>
                <li>Seguir tu progreso y estadísticas</li>
              </ul>

              <p class="text">
                Si no creaste esta cuenta, puedes ignorar este correo de forma segura.
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
                ¿Tienes problemas? <a href="mailto:soporte@gympoint.app" class="footer-link">Contáctanos</a>
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

module.exports = { emailVerificationTemplate };
