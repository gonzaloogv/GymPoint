const authService = require('../services/auth-service');
const RefreshToken = require('../models/RefreshToken');

const register = async (req, res) => {
  try {
    const user = await authService.register(req.body);
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const { generarToken } = require('../utils/jwt');

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { token, refreshToken, user } = await authService.login(email, password, req);

    res.json({ accessToken: token, refreshToken, user });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
};

module.exports = { register, login };
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const googleLogin = async (req, res) => {
  const { token } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const { email, name } = payload;

    let user = await User.findOne({ where: { email } });

    if (!user) {
      user = await User.create({
        name,
        lastname: '',
        email,
        gender: 'O',
        locality: '',
        age: 0,
        subscription: 'FREE',
        tokens: 0
      });
    }

    const accessToken = generarToken(user);

    const refreshToken = jwt.sign(
      { id_user: user.id_user },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    await RefreshToken.create({
      id_user: user.id_user,
      token: refreshToken,
      user_agent: req.headers['user-agent'] || '',
      ip_address: req.ip || '',
      expires_at: new Date(Date.now() + 7 * 86400000)
    });

    res.json({ user, accessToken, refreshToken });
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: 'Token de Google inválido o expirado' });
  }
};

const refreshAccessToken = async (req, res) => {
  const { token } = req.body;

  try {
    const registro = await RefreshToken.findOne({ where: { token, revoked: false } });

    if (!registro || new Date(registro.expires_at) < new Date()) {
      return res.status(403).json({ error: 'Refresh token inválido o expirado' });
    }

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findByPk(decoded.id_user);

    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    const accessToken = generarToken(user);
    res.json({ accessToken });
  } catch (err) {
    res.status(401).json({ error: 'Token inválido o expirado' });
  }
};

const logout = async (req, res) => {
  const { token } = req.body;

  try {
    await RefreshToken.update({ revoked: true }, { where: { token } });
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ error: 'Error al cerrar sesión' });
  }
};

module.exports = {
  ...module.exports, 
  googleLogin,
  refreshAccessToken,
  logout
};
