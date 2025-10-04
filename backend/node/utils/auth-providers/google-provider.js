const { OAuth2Client } = require('google-auth-library');

/**
 * Google OAuth2 Provider
 * Maneja la verificación y validación de tokens de Google
 */
class GoogleAuthProvider {
  constructor() {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    
    if (!clientId) {
      throw new Error('GOOGLE_CLIENT_ID no está configurado en las variables de entorno');
    }
    
    this.client = new OAuth2Client(clientId);
    this.clientId = clientId;
  }

  /**
   * Verifica y valida un token de Google
   * @param {string} idToken - Token de ID de Google
   * @returns {Promise<GoogleUserInfo>} Información del usuario de Google
   * @throws {Error} Si el token es inválido o expirado
   */
  async verifyToken(idToken) {
    try {
      const ticket = await this.client.verifyIdToken({
        idToken,
        audience: this.clientId
      });

      const payload = ticket.getPayload();

      // Validar que el email esté verificado
      if (!payload.email_verified) {
        throw new Error('El email de Google no está verificado');
      }

      // Extraer información relevante
      return {
        googleId: payload.sub,
        email: payload.email,
        emailVerified: payload.email_verified,
        name: payload.given_name || payload.name || '',
        lastName: payload.family_name || '',
        picture: payload.picture || null,
        locale: payload.locale || null
      };
    } catch (error) {
      // Mejorar el mensaje de error
      if (error.message.includes('Token used too early')) {
        throw new Error('Token de Google inválido: usado antes de tiempo');
      }
      if (error.message.includes('Token used too late')) {
        throw new Error('Token de Google expirado');
      }
      if (error.message.includes('Wrong recipient')) {
        throw new Error('Token de Google inválido: audiencia incorrecta');
      }
      
      throw new Error(`Token de Google inválido: ${error.message}`);
    }
  }

  /**
   * Valida que un usuario de Google sea elegible para el registro
   * @param {GoogleUserInfo} googleUser - Información del usuario de Google
   * @returns {boolean} true si es válido
   * @throws {Error} Si no cumple los requisitos
   */
  validateGoogleUser(googleUser) {
    if (!googleUser.email) {
      throw new Error('El usuario de Google no tiene email');
    }

    if (!googleUser.emailVerified) {
      throw new Error('El email de Google debe estar verificado');
    }

    return true;
  }
}

module.exports = GoogleAuthProvider;

