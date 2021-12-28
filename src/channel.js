const mongoose = require("mongoose");

const BDay = mongoose.model("channel", {
  channel: {
    type: String,
    required: true,
  },
  guild_id: {
    type: String,
    required: true,
  },
});

module.exports = BDay;
