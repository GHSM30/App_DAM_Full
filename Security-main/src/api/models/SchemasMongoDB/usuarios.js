const mongoose = require('mongoose');

const privilegeSchema = new mongoose.Schema({
  PRIVILEGEID: String,
  PRIVILEGENAME: String
}, { _id: false });

const processSchema = new mongoose.Schema({
  PROCESSID: String,
  PROCESSNAME: String,
  APPLICATIONID: String,
  APLICATIONNAME: String,
  VIEWID: String,
  VIEWNAME: String,
  PRIVILEGES: [privilegeSchema]
}, { _id: false });

const detailRowRegSchema = new mongoose.Schema({
  CURRENT: Boolean,
  REGDATE: Date,
  REGTIME: Date,
  REGUSER: String
}, { _id: false });

const roleSchema = new mongoose.Schema({
  ROLEID: String,
  ROLEIDSAP: String,
  ROLENAME: String,
  DESCRIPTION: String,
  PROCESSES: [processSchema],
  DETAIL_ROW: {
    ACTIVED: { type: Boolean, default: true },
    DELETED: { type: Boolean, default: false },
    DETAIL_ROW_REG: [detailRowRegSchema]
  }
}, { _id: false });

const usuarioSchema = new mongoose.Schema({
  USERID: { type: String, required: true },
  PASSWORD: String,
  USERNAME: String,
  ALIAS: String,
  FIRSTNAME: String,
  LASTNAME: String,
  BIRTHDAYDATE: String,
  COMPANYID: Number,
  COMPANYNAME: String,
  COMPANYALIAS: String,
  CEDIID: String,
  EMPLOYEEID: String,
  EMAIL: String,
  PHONENUMBER: String,
  EXTENSION: String,
  DEPARTMENT: String,
  FUNCTION: String,
  STREET: String,
  POSTALCODE: Number,
  CITY: String,
  REGION: String,
  STATE: String,
  COUNTRY: String,
  AVATAR: String,
  ROLES: [roleSchema],
  DETAIL_ROW: {
    ACTIVED: { type: Boolean, default: true },
    DELETED: { type: Boolean, default: false },
    DETAIL_ROW_REG: [detailRowRegSchema]
  }
}, {
  collection: 'users',
  timestamps: true,
  versionKey: false
});

module.exports = mongoose.model('users', usuarioSchema);
