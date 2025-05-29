const mongoose = require('mongoose');

const viewsSchema = new mongoose.Schema({
  COMPANYID: { type: Number, required: true },
  CEDIID: { type: Number, required: true },
  LABELID: { type: String, required: true },
  VALUEPAID: { type: String, required: true },
  VALUEID: { type: String, required: true },
  VALUE: { type: String, required: true },
  ALIAS: { type: String },
  SEQUENCE: { type: Number },
  IMAGE: { type: String },
  VALUESAPID: { type: String, default: '' },
  DESCRIPTION: { type: String },
  ROUTE: { type: String }
}, {
  collection: 'views',
  timestamps: true, // Para createdAt y updatedAt
  versionKey: false
});





viewsSchema.set('toObject', { versionKey: false });
viewsSchema.set('toJSON', { versionKey: false });

module.exports = mongoose.model('views', viewsSchema);
