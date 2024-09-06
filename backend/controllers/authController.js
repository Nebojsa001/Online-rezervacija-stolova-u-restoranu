const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const User = require("./../models/userModel");
const catchAsync = require("./../utils/catchAsync");
const appError = require("./../utils/appError");
//const sendEmail = require("./../utils/email");
const crypto = require("crypto");

//functions
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user.id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 3600 * 1000
    ), // sate pretvaramo u milisekunde
    secure: true,
    httpOnly: true, //cookie se ne moze promijeniti nikako u browseru, zastita od css attack
  };

  res.cookie("jwt", token, cookieOptions);

  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    password: req.body.password,
  });

  createSendToken(newUser, 201, res);
});

//login
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  //1
  if (!email || !password) {
    return next(new appError("Proveri email i password", 400));
  }
  //2
  const user = await User.findOne({
    where: { email },
  });

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new appError("Pogrešan email ili password", 401));
  }
  //3
  createSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  //1 Get token and check
  let token;
  console.log(token);
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(new appError("Uloguj se!", 401));
  }
  //2 Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  //3 Check if user still exists

  const currentUser = await User.findByPk(decoded.id);

  if (!currentUser) {
    return next(new appError("Korisnik više ne postoji", 401));
  }
  req.user = currentUser;
  next();
});

exports.restrictTo = (...roles) => {
  // PERMISIJE
  return (req, res, next) => {
    // roles ['superAdmin','blogger']. role='user'
    if (!roles.includes(req.user.role)) {
      return next(new appError("Nemate ovlaštenje za ovu akciju", 403));
    }
    next();
  };
};
