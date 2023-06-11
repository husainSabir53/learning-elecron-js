const mongoose = require("mongoose");
function connectToDatabase() {
  return mongoose.connect("mongodb+srv://husain53sabir:husain@husain.mkoqhyc.mongodb.net/")

}

module.exports = connectToDatabase