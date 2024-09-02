const { Sequelize, DataTypes, Op, Model } = require("sequelize");
const db = require("../config/database");
const User = require("./userModel");
const Table = require("./tableModel");

const Reservation = db.define("Reservation", {
  startTime: {
    type: Sequelize.DATE,
    allowNull: false,
  },
  endTime: {
    type: Sequelize.DATE,
    allowNull: false,
  },
  userId: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: "id",
    },
    allowNull: false,
  },
  tableId: {
    type: DataTypes.INTEGER,
    references: {
      model: Table,
      key: "id",
    },
    allowNull: false,
  },
  guests: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    validate: {
      min: 1,
      max: 8,
    },
  },
});

Reservation.belongsTo(Table, { foreignKey: "tableId", as: "table" });
Reservation.belongsTo(User, { foreignKey: "userId", as: "user" });

Reservation.sync()
  .then(() => {
    console.log("Tabela i model sinhronizovani");
  })
  .catch((err) => {
    console.log("Greska u sinhronizovanju", err);
  });

module.exports = Reservation;
