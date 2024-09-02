const { Sequelize, DataTypes, Op, Model } = require("sequelize");
const db = require("../config/database");
const User = require("./userModel");

const Table = db.define("Table", {
  seats: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  waiterId: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: "id",
    },
    allowNull: false,
  },
});

Table.belongsTo(User, { as: "waiter", foreignKey: "waiterId" });

Table.sync()
  .then(() => {
    console.log("Tabela i model sinhronizovani");
  })
  .catch((err) => {
    console.log("Greska u sinhronizovanju", err);
  });

module.exports = Table;
