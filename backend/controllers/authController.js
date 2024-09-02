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
  //const user = await User.findOne({ email }).select("+password");
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

// exports.forgotPassword = catchAsync(async (req, res, next) => {
//   // ZABORAVLJENA LOZINKA
//   // 1) Get user based on Post email
//   const user = await User.findOne({ email: req.body.email });
//   if (!user) {
//     return next(new appError(`Korisnik sa ovom adresom ne postoji`, 404));
//   }
//   // 2) Generate radnom token
//   const resetToken = user.createPasswordResetToken();
//   await user.save({ validateBeforeSave: false });
//   // 3) Send back with email
//   const resetURL = `${req.protocol}://${req.get(
//     "host"
//   )}/api/v1/users/resetPassword/${resetToken}`;

//   const message = `Zaboravili ste vašu lozinku? Unesite PATCH zahtev sa vašom novom lozinkom i potvrdu te iste lozinke na ${resetURL}.\nAko niste zavoravili vašu lozinku samo ignorišite ovu poruku!`;

//   try {
//     await sendEmail({
//       email: user.email, //isto kao req.body.email
//       subject: "Vaš token za restovanje lozinke (vredi 10min)",
//       message,
//     });
//     res.status(200).json({
//       status: "success",
//       message: "Token je poslat na vaš mejl!",
//     });
//   } catch (err) {
//     user.passwordResetToken = undefined;
//     user.passwordResetExpires = undefined;
//     await user.save({ validateBeforeSave: false });

//     return next(
//       new appError("Greška prilikom slanja mejla. Pokušajte kasnije!", 500)
//     );
//   }
// });
// exports.resetPassword = catchAsync(async (req, res, next) => {
//   // 1) Get user based on token
//   const hashedToken = crypto
//     .createHash("sha256")
//     .update(req.params.token)
//     .digest("hex");

//   const user = await User.findOne({
//     passwordResetToken: hashedToken,
//     passwordResetExpires: { $gt: Date.now() }, //ako je passwordResetExpires veci od danasnjeg datuma(poziva funkcije) onda je oke
//   });
//   // 2) If token has not expired, and there is user, set the new password
//   if (!user) {
//     return next(
//       new appError("Vaš token nije tačan ili je istekao. Pokušajte opet!", 400)
//     );
//   }
//   user.password = req.body.password;
//   user.passwordConfirm = req.body.passwordConfirm;
//   user.passwordResetToken = undefined;
//   user.passwordResetExpires = undefined;
//   await user.save(); //sacuvava na semi
//   // 3) Update changedPasswordAt property for the user
//   // 4) Log in the user in, send JWT
//   createSendToken(newUser, 201, res);
// });

// exports.updatePassword = catchAsync(async (req, res, next) => {
//   // 1) Get user from collection
//   const user = await User.findById(req.user.id).select("+password");
//   console.log(user);
//   if (!user) {
//     return next(
//       new appError("Vaš token nije tačan ili je istekao. Pokušajte opet!", 400)
//     );
//   }
//   // 2) Check if Posted currently password is correct
//   if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
//     return next(new appError("Vaša trenutna lozinka je pogresna", 401));
//   }
//   // 3) If so, update password
//   user.password = req.body.password;
//   user.passwordConfirm = req.body.passwordConfirm;
//   await user.save(); //sacuvava na semi (prvo salje password i passwordConfirm zatim ih provjerava u validatoru i sacuvava)
//   // 4) Log user in, send JWT
//   createSendToken(user, 201, res);
// });
