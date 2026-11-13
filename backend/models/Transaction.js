const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: ['income', 'expense'], required: [true, 'Le type est obligatoire'] },
    montant: { type: Number, required: [true, 'Le montant est obligatoire'], min: [0.01, 'Le montant doit être positif'] },
    categorie: { type: String, required: [true, 'La catégorie est obligatoire'], trim: true },
    description: { type: String, trim: true, default: '' },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Transaction', transactionSchema);