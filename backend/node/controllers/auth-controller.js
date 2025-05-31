const authService = require('../services/auth-service');

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
    const { user } = await authService.login(email, password);

    const token = generarToken(user);

    res.json({ token, user });
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

    res.json({ user, token: accessToken });
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: 'Token de Google inválido o expirado' });
  }
};

module.exports = {
  ...module.exports, 
  googleLogin
};
