const express = require("express");
const app = express();
const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config();
const authRoute = require("../routes/auth");
const postRoute = require("../routes/posts");

//connect
mongoose.connect(
  process.env.DB_CONNECT,
  { useNewUrlParser: true, useCreateIndex: true },
  () => console.log("DB connected successfully")
);

app.use(express.json());

// middleware
app.use("/api/user", authRoute);
app.use("/api/posts", postRoute);

app.listen(3000, () => console.log("Running at 3000"));
