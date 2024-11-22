const mongoose = require('mongoose')

const connectDB = (url) => {
  return mongoose.connect(url, { dbName: "Store-API" })
}

module.exports = connectDB
