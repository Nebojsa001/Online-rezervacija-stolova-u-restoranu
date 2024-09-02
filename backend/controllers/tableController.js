const { promisify } = require("util");
const Table = require("./../models/tableModel");
const User = require("./../models/userModel");
const catchAsync = require("./../utils/catchAsync");
const appError = require("./../utils/appError");

exports.createTable = catchAsync(async (req, res, next) => {
  console.log("ee");

  const newTable = await Table.create({
    seats: req.body.seats,
    waiterId: req.body.waiterId,
  });

  if (!newTable) {
    return next(
      new appError("Neuspijesno kreiranje stola, okusajte ponovo!"),
      400
    );
  }
  res.status(200).json({
    status: "success",
    message: "Sto je uspješno kreiran!",
    data: newTable,
  });
});

exports.getAllTables = catchAsync(async (req, res, next) => {
  const tables = await Table.findAll({
    include: {
      model: User,
      as: "waiter",
      attributes: ["id", "firstName", "lastName"],
    },
  });
  if (!tables) {
    return next(new appError("Trenutno nema stolova!"), 400);
  }

  res.status(200).json({
    status: "success",
    data: tables,
  });
});

exports.getTableById = catchAsync(async (req, res, next) => {
  const table = await Table.findById(req.params.id);
  if (!table) {
    return next(new appError("Sto ne postoji!"), 404);
  }
  res.status(200).json({
    status: "success",
    data: table,
  });
});
