const express = require('express');
const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const auth = require('../middleware/auth');

const router = express.Router();
router.use(auth); // toutes les routes ci-dessous exigent un token

const idValide = (id) => mongoose.isValidObjectId(id);

const erreur = (res, err) => {
  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: Object.values(err.errors)[0].message });
  }
  res.status(500).json({ message: 'Erreur serveur' });
};

// GET /api/transactions?type=&categorie=&from=&to=&search=
router.get('/', async (req, res) => {
  try {
    const { type, categorie, from, to, search } = req.query;
    const filtre = { user: req.userId };

    if (type === 'income' || type === 'expense') filtre.type = type;
    if (categorie) filtre.categorie = categorie;
    if (from || to) {
      filtre.date = {};
      if (from) filtre.date.$gte = new Date(from);
      if (to) filtre.date.$lte = new Date(to);
    }
    if (search) {
      const motif = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filtre.$or = [
        { description: { $regex: motif, $options: 'i' } },
        { categorie: { $regex: motif, $options: 'i' } },
      ];
    }

    const liste = await Transaction.find(filtre).sort({ date: -1, createdAt: -1 });
    res.json(liste);
  } catch (err) {
    erreur(res, err);
  }
});

// GET /api/transactions/stats  (doit rester AVANT /:id)
router.get('/stats', async (req, res) => {
  try {
    const user = new mongoose.Types.ObjectId(req.userId);

    const [totaux, parCategorie, parMois] = await Promise.all([
      Transaction.aggregate([
        { $match: { user } },
        { $group: { _id: '$type', total: { $sum: '$montant' } } },
      ]),
      Transaction.aggregate([
        { $match: { user, type: 'expense' } },
        { $group: { _id: '$categorie', total: { $sum: '$montant' } } },
        { $sort: { total: -1 } },
      ]),
      Transaction.aggregate([
        { $match: { user } },
        {
          $group: {
            _id: { annee: { $year: '$date' }, mois: { $month: '$date' }, type: '$type' },
            total: { $sum: '$montant' },
          },
        },
      ]),
    ]);

    const revenus = totaux.find((t) => t._id === 'income')?.total || 0;
    const depenses = totaux.find((t) => t._id === 'expense')?.total || 0;

    // Regroupe par mois : { mois: "2026-11", revenus, depenses }
    const moisMap = {};
    parMois.forEach(({ _id, total }) => {
      const cle = `${_id.annee}-${String(_id.mois).padStart(2, '0')}`;
      moisMap[cle] = moisMap[cle] || { mois: cle, revenus: 0, depenses: 0 };
      if (_id.type === 'income') moisMap[cle].revenus = total;
      else moisMap[cle].depenses = total;
    });

    res.json({
      revenus,
      depenses,
      solde: revenus - depenses,
      parCategorie: parCategorie.map((c) => ({ categorie: c._id, total: c.total })),
      parMois: Object.values(moisMap).sort((a, b) => a.mois.localeCompare(b.mois)),
    });
  } catch (err) {
    erreur(res, err);
  }
});

// GET /api/transactions/:id
router.get('/:id', async (req, res) => {
  if (!idValide(req.params.id)) return res.status(400).json({ message: 'Identifiant invalide' });
  const t = await Transaction.findOne({ _id: req.params.id, user: req.userId });
  if (!t) return res.status(404).json({ message: 'Transaction introuvable' });
  res.json(t);
});

// POST /api/transactions
router.post('/', async (req, res) => {
  try {
    const { type, montant, categorie, description, date } = req.body;
    const t = await Transaction.create({ user: req.userId, type, montant, categorie, description, date });
    res.status(201).json(t);
  } catch (err) {
    erreur(res, err);
  }
});

// PUT /api/transactions/:id
router.put('/:id', async (req, res) => {
  if (!idValide(req.params.id)) return res.status(400).json({ message: 'Identifiant invalide' });
  try {
    const { type, montant, categorie, description, date } = req.body;
    const t = await Transaction.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      { type, montant, categorie, description, date },
      { new: true, runValidators: true }
    );
    if (!t) return res.status(404).json({ message: 'Transaction introuvable' });
    res.json(t);
  } catch (err) {
    erreur(res, err);
  }
});

// DELETE /api/transactions/:id
router.delete('/:id', async (req, res) => {
  if (!idValide(req.params.id)) return res.status(400).json({ message: 'Identifiant invalide' });
  const t = await Transaction.findOneAndDelete({ _id: req.params.id, user: req.userId });
  if (!t) return res.status(404).json({ message: 'Transaction introuvable' });
  res.json({ message: 'Transaction supprimée' });
});

module.exports = router;