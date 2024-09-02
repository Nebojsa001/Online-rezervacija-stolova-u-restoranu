const { promisify } = require("util");
const { Op } = require("sequelize");
const Reservation = require("./../models/reservationModel");
const User = require("./../models/userModel");
const Table = require("./../models/tableModel");
const catchAsync = require("./../utils/catchAsync");
const appError = require("./../utils/appError");
const dotenv = require("dotenv");
const { start } = require("repl");

exports.createReservation = catchAsync(async (req, res, next) => {
  const table = await Table.findByPk(req.body.tableId);
  const startTime = req.body.startTime;
  const endTime = req.body.endTime;
  const tableId = req.body.tableId;

  const startMinutes = new Date(startTime).getMinutes();
  const endMinutes = new Date(endTime).getMinutes();

  const startHours = new Date(startTime).getHours();
  const endHours = new Date(endTime).getHours();

  //ispitati postoji li sto
  if (!table) {
    return next(
      new appError("Ne mozete rezervisati sto koji ne postoji!"),
      400
    );
  }
  if (req.body.guests > table.seats) {
    // provjeriti koliko mjesta ima za tim istim stolom
    return next(new appError("Nedovoljno mijesta na stolu!"), 400);
  }
  if (startMinutes != 0 && endMinutes != 0) {
    //rezervacija moze samo da pocne tacan sat i mora da bude sat posle prethone rezervacije
    //kako bi konobar ocistio i pripremio sto
    return next(
      new appError(
        "Rezervacije mogu da budu samo npr 14:00 do 16:00 a ne 14:30"
      ),
      400
    );
  }
  if (startHours == endHours || startTime > endTime) {
    // rezervacija ne moze da traje 1 dan i 0 sati ili da se prvo zavrsi prije nego pocne
    return next(new appError("Ovakva rezervacija nije moguća!")), 400;
  }

  if (
    //kontrola radnog vremena
    startHours < process.env.POCETAK_RADNOG_VREMENA ||
    endHours > process.env.KRAJ_RADNOG_VREMENA
  ) {
    console.log("eee");

    return (
      next(
        new appError(
          `Radno vrijeme je od ${process.env.POCETAK_RADNOG_VREMENA}:00 do ${process.env.KRAJ_RADNOG_VREMENA}:00`
        )
      ),
      400
    );
  }

  const conflictReservation = await Reservation.findOne({
    where: {
      tableId,
      [Op.or]: [
        {
          startTime: {
            [Op.between]: [startTime, endTime],
          },
        },
        {
          endTime: {
            [Op.between]: [startTime, endTime],
          },
        },
        {
          [Op.and]: [
            { startTime: { [Op.lt]: startTime } },
            { endTime: { [Op.gt]: endTime } },
          ],
        },
      ],
    },
  });

  if (conflictReservation) {
    return next(
      new appError(
        "Rezervacija je zauzeta! Molimo vas odlucite za drugu termin!"
      ),
      400
    );
  }

  const newReservation = await Reservation.create({
    startTime: req.body.startTime,
    endTime: req.body.endTime,
    guests: req.body.guests,
    tableId: req.body.tableId,
    userId: req.user.id,
  });

  if (!newReservation) {
    return next(
      new appError("Neuspijesno kreiranje rezervacije, pokusajte ponovo!"),
      400
    );
  }
  res.status(200).json({
    status: "success",
    message: "Vaša rezervacija je uspijesna!",
    data: newReservation,
  });
});

exports.getAllReservations = catchAsync(async (req, res, next) => {
  const reservations = await Reservation.findAll({
    include: {
      model: Table,
      as: "table",
      attributes: ["id", "seats"],
      include: [
        {
          model: User,
          as: "waiter",
          attributes: ["firstName", "lastName"],
        },
      ],
    },
  });
  if (!reservations) {
    return next(new appError("Trenutno nema stolova!"), 400);
  }

  res.status(200).json({
    status: "success",
    data: reservations,
  });
});

exports.deleteReservation = catchAsync(async (req, res, next) => {
  const reservation = await Reservation.findByPk(req.body.guestEmail);

  if (!reservation) {
    return next(new appError("Rezervacija nije pronadjena!"), 404);
  }
  await reservation.destroy();

  res.status(204).json({
    status: "success",
    message: "Rezervacija je uspjesno obrisana!",
  });
});

exports.getAllFreeReservations = catchAsync(async (req, res, next) => {
  const selectedDate = req.query.selectedDate;
  const tableId = req.query.tableId;

  if (!tableId) {
    return next(new appError("Morate uneti ID stola!"), 400);
  }
  if (!selectedDate) {
    return next(new appError("Morate uneti datum!"), 400);
  }

  console.log(
    `${selectedDate}T${process.env.POCETAK_RADNOG_VREMENA}:00:00+02:00`
  );
  console.log(`${selectedDate}T${process.env.KRAJ_RADNOG_VREMENA}:00:00+02:00`);

  const reservations = await Reservation.findAll({
    where: {
      tableId,
      startTime: {
        [Op.gte]: new Date(
          `${selectedDate}T${process.env.POCETAK_RADNOG_VREMENA}:00:00+02:00`
        ),
      },
      endTime: {
        [Op.lt]: new Date(
          `${selectedDate}T${process.env.KRAJ_RADNOG_VREMENA}:00:00+02:00`
        ),
      },
    },
    order: [["startTime", "ASC"]],
  });

  const freeSlots = [];
  let lastEndTime = new Date(
    `${selectedDate}T${process.env.POCETAK_RADNOG_VREMENA}:00:00.000Z`
  );
  const endOfDay = new Date(
    `${selectedDate}T${process.env.KRAJ_RADNOG_VREMENA}:00:00.000Z`
  );

  reservations.forEach((reservation) => {
    const startTime = new Date(reservation.startTime);

    if (lastEndTime < startTime) {
      freeSlots.push({
        start: lastEndTime,
        end: startTime,
      });
    }

    lastEndTime = new Date(reservation.endTime);
  });

  if (lastEndTime < endOfDay) {
    freeSlots.push({
      start: lastEndTime,
      end: endOfDay,
    });
  }

  res.status(200).json({
    status: "success",
    reservations,
    freeSlots,
  });
});
