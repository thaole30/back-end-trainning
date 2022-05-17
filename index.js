const express = require("express");
require("dotenv").config();
const { getDbInstance } = require("./db");
const { transporter } = require("./transporter");
const userRouter = require("./routes/user");
const uploadRouter = require("./routes/upload");
const downloadRouter = require("./routes/download");
const port = process.env.PORT;

var cron = require("node-cron");

// cron.schedule('* * * * *', () => {
//   console.log('running a task every minute');
// });

const options = {
  from: "anhdaonapa123@gmail.com",
  to: "thaothao30052000@gmail.com",
  subject: "Hello",
  html: "Hello my friend !",
};

cron.schedule("* * * * *", () => {
  // transporter.sendMail(options);
  console.log("sendmail");
});

const main = async () => {
  await getDbInstance();
  const app = express();
  app.use(express.json());
  app.use("/users", userRouter);
  app.use("/upload", uploadRouter);
  app.use("/download", downloadRouter);

  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });
};

main();
