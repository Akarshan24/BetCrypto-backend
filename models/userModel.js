const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  alias: {
    type: String,
    required: true,
  },
  email:{
    type : String,
    required: true
  },
  password: {
    type: String,
    required: true,
  },
  paymentPasscode: {
    type: String,
    required: true
  },
  emailVerificationCode:{
    type: String,
    required: false
  },
  isEmailVerified:{
    type: Boolean,
    required: false
  }
});

const User = mongoose.model("User", UserSchema);

module.exports = User;