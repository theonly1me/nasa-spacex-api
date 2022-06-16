const mongoose = require('mongoose');
require('dotenv').config();
const DB_URI = process.env.DB_URI;

mongoose.connection.once('open', () => {
  console.log('DB connection established.');
});

mongoose.connection.on('error', e => {
  console.error('An error occured while trying to connect to the DB', e);
});

const mongoConnect = async () => {
  await mongoose.connect(DB_URI);
};

const mongoDisconnect = async () => {
  await mongoose.disconnect();
};

module.exports = {
  mongoConnect,
  mongoDisconnect,
};
