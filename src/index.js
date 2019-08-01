const express = require("express");
const app = express();
const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config();
const authRoute = require("../routes/auth");

//connect
mongoose.connect(
  process.env.DB_CONNECT_OFFLINE,
  { useNewUrlParser: true, useCreateIndex: true },
  () => console.log("DB connected successfully")
);

app.use(express.json());

// middleware
const port = process.env.PORT || 3000
app.use("/api/user", authRoute);
app.listen(port, () => console.log("Running at ",port));
