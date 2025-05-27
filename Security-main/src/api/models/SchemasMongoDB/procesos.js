const mongoose = require('mongoose');

const procesoSchema = new mongoose.Schema({
  COMPANYID: { type: Number, required: true },
  CEDIID: { type: Number, required: true },
  LABELID: { type: String, required: true },
  VALUEPAID: { type: String },
  VALUEID: { type: String, required: true },
  VALUE: { type: String, required: true },
  ALIAS: { type: String },
  SEQUENCE: { type: Number },
  IMAGE: { type: String },
  VALUESAPID: { type: String },
  DESCRIPTION: { type: String }
}, {
  collection: 'process',
  timestamps: true, // Opcional: createdAt y updatedAt automáticos
  versionKey: false
});

procesoSchema.set('toObject', { versionKey: false });
procesoSchema.set('toJSON', { versionKey: false });


module.exports = mongoose.model('process', procesoSchema);
