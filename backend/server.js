const dotenv = require("dotenv");

const db = require("./config/database");

dotenv.config({ path: "./config.env" });
const app = require("./app");

//test db
db.authenticate()
  .then(() => {
    console.log("Baza uspjesno konentovana!");
  })
  .catch((err) => {
    console.error("Baza nije konektovana:", err);
  });

const port = process.env.PORT;
app.listen(port, () => {
  console.log(`App running on port ${port}`);
});
