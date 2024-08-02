const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  verificationCode: { type: String },
  verificationCodeExpiresAt: {type: Date},
  verified: { type: Boolean, default: false },
});



module.exports = mongoose.model('User', UserSchema);

