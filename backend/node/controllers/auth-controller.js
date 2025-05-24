// controllers/auth-controller.js
const authService = require('../services/auth-service');

const register = async (req, res) => {
  try {
    const user = await authService.register(req.body);
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { token, user } = await authService.login(email, password);
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
    // Verificamos el token con Google
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();

    const { email, name, picture } = payload;

    // Buscamos si ya existe el usuario
    let user = await User.findOne({ where: { email } });

    if (!user) {
      // Si no existe, lo creamos
      user = await User.create({
        name,
        lastname: '',
        email,
        gender: 'O',
        locality: '',
        age: 0,
        subscription: 'FREE',
        tokens: 0
        // No seteamos password
      });
    }

    // Creamos JWT
    const accessToken = jwt.sign({ id: user.id_user }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.json({ user, token: accessToken });
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: 'Invalid Google token' });
  }
};

module.exports = {
  ...module.exports, // mantiene los otros métodos como register, login si los tenés
  googleLogin
};
