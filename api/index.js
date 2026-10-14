const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

// Load environment variables if .env file exists
[
  path.resolve(__dirname, '../.env'),
  path.resolve(__dirname, '../server/.env'),
].forEach((p) => {
  if (fs.existsSync(p)) dotenv.config({ path: p, override: false });
});

const connectDB = require('../server/src/config/db');
const ensureAdminUser = require('../server/src/services/ensureAdminUser');
const app = require('../server/src/app');

let adminEnsured = false;

module.exports = async (req, res) => {
  try {
    await connectDB();
    if (!adminEnsured) {
      await ensureAdminUser();
      adminEnsured = true;
    }
  } catch (err) {
    console.error('MongoDB connection error in Vercel function:', err.message);
  }
  return app(req, res);
};
