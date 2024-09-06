const catchAsync = require("./../utils/catchAsync");
const appError = require("./../utils/appError");
const User = require("../models/userModel");

exports.promoteToWaiter = catchAsync(async (req, res, next) => {
  const user = await User.findByPk(req.params.id);
  if (!user) {
    return next(new appError("Korisnik ne postoji", 404));
  }

  if (user.role === "waiter" || user.role === "admin") {
    return next(new appError("Korisnik je vec konobar ili admin", 400));
  }

  user.role = "waiter";
  await user.save();

  res.status(200).json({
    status: "success",
    message: `Korisnik ${user.firstName} ${user.lastName} je uspješno promijenjen u konobara!`,
    data: user,
  });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findByPk(req.params.id);
  if (!user) {
    return next(new appError("Korisnik ne postoji", 404));
  }

  if (user.role === "admin") {
    return next(new appError("Ne mozete brisati admina", 403));
  }

  await user.destroy();

  res.status(204).json({
    status: "success",
    message: "Korisnik je uspješno obrisan!",
  });
});
