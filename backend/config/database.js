const Sequelize = require("sequelize");
const dotenv = require("dotenv");

dotenv.config({ path: "./config.env" });

module.exports = new Sequelize(
  process.env.DB_DATABASE,
  process.env.DB_USERNAME,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "postgres",
    timezone: "UTC",
  }
);
