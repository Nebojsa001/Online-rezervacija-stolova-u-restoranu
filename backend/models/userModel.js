const { Sequelize, DataTypes, Op, Model } = require("sequelize");
const db = require("../config/database");
const bcrypt = require("bcryptjs");

const User = db.define(
  "User",
  {
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      lowercase: true,
      validate: {
        isEmail: {
          args: true,
          msg: "Neispravna email adresa",
        },
      },
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [["user", "waiter", "admin"]],
      },
      defaultValue: "user",
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: {
          args: [8],
          msg: "Lozinka mora sadržavati 8 ili više karaktera",
        },
      },
      select: false, // osigurava da se ova kolona ne vraća podrazumijevano prilikom dohvaćanja korisnika
    },
  },
  {
    hooks: {
      beforeCreate: async (user, options) => {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      },
    },
  }
);

User.sync()
  .then(() => {
    console.log("Tabela i model sinhronizovani");
  })
  .catch((err) => {
    console.log("Greska u sinhronizovanju", err);
  });

module.exports = User;
User.prototype.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};
