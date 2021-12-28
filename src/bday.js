const mongoose = require("mongoose");

const BDay = mongoose.model("bday", {
  user_id: {
    type: String,
    required: true,
  },
  guild_id: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    require: true,
  },
});

module.exports = BDay;
