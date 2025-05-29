const mongoose = require('mongoose');

const catalogoSchema = new mongoose.Schema({
  COMPANYID: { type: String, required: true },
  CEDIID: { type: String, required: true },
  LABELID: { type: String, required: true },
  LABEL: { type: String, required: true },
  INDEX: { type: String },
  COLLECTION: { type: String },
  SECTION: { type: String },
  SEQUENCE: { type: Number },
  IMAGE: { type: String },
  DESCRIPTION: { type: String },

  DETAIL_ROW: {
    ACTIVED: { type: Boolean, default: true },
    DELETED: { type: Boolean, default: false },
    DETAIL_ROW_REG: [
      {
        _id: false,
        CURRENT: { type: Boolean, default: true },
        REGDATE: { type: Date },
        REGTIME: { type: Date },
        REGUSER: { type: String }
      }
    ]
  }
}, {
  collection: 'catalogs',
  timestamps: true, // Opcional: para agregar createdAt y updatedAt automáticos
  versionKey: false
});

module.exports = mongoose.model('catalogs', catalogoSchema);

console.log('✅ Se está usando schema de catalogs con versionKey: false');
module.exports = mongoose.model('catalogs', catalogoSchema);

