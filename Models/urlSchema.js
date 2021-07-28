const mongoose = require("mongoose");

const URLSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  surname: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  confirm: {
    type: Boolean,
    default: false,
  },
  resetToken: String,
  expireTime: Date,
  urlData: [
    {
      urlCode: String,
      longUrl: String,
      shortUrl: String,
      date: {
        type: String,
        default: Date.now,
      },
    },
  ],
});

module.exports = mongoose.model("user", URLSchema);
