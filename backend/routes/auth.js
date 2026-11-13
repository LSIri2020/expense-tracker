const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

const creerToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

const publicUser = (u) => ({ id: u._id, nom: u.nom, email: u.email });

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { nom, email, password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'Le mot de passe doit contenir au moins 6 caractères' });
    }

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ nom, email, password: hash });

    res.status(201).json({ token: creerToken(user._id), user: publicUser(user) });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'Cet email est déjà utilisé' });
    }
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: Object.values(err.errors)[0].message });
    }
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: (email || '').toLowerCase().trim() });

    const ok = user && (await bcrypt.compare(password || '', user.password));
    if (!ok) return res.status(401).json({ message: 'Email ou mot de passe incorrect' });

    res.json({ token: creerToken(user._id), user: publicUser(user) });
  } catch {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// GET /api/auth/me  (route protégée)
router.get('/me', auth, async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ message: 'Utilisateur introuvable' });
  res.json(publicUser(user));
});

module.exports = router;