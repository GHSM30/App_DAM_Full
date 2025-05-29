const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  ROLEID: { type: String, required: true },
  ROLENAME: { type: String, required: true },
  DESCRIPTION: { type: String },

  PROCESSES: [
    {
      PROCESSID: { type: String },
      PROCESSNAME: { type: String },
      VIEWID: { type: String },
      VIEWNAME: { type: String },
      APPLICATIONID: { type: String },
      APPLICATIONNAME: { type: String },
      PRIVILEGES: [
        {
          PRIVILEGEID: { type: String },
          PRIVILEGENAME: { type: String }
        }
      ]
    }
  ],

  DETAIL_ROW: {
    ACTIVED: { type: Boolean, default: true },
    DELETED: { type: Boolean, default: false },
    DETAIL_ROW_REG: [
      {
        CURRENT: { type: Boolean, default: true },
        REGDATE: { type: Date },
        REGTIME: { type: Date },
        REGUSER: { type: String }
      }
    ]
  }

}, {
  collection: 'roles',
  timestamps: true, // Opcional: para createdAt y updatedAt
  versionKey: false

});

module.exports = mongoose.model('roles', roleSchema);
