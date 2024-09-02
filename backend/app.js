const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());
// const morgan = require("morgan");

const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");
const tableRouter = require("./routes/tableRoutes");
const userRouter = require("./routes/userRoutes");
const reservationRouter = require("./routes/reservationRoutes");

console.log(process.env.NODE_ENV);

app.use("/api/v1/user", userRouter);
app.use("/api/v1/table", tableRouter);
app.use("/api/v1/reservation", reservationRouter);

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
