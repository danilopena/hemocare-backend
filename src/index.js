const express = require("express");
const app = express();
const dotenv = require("dotenv");
const mongoose = require("mongoose");
dotenv.config();
const stockRoute = require("../routes/stock");
const authRoute = require("../routes/auth");
const postRoute = require("../routes/posts");
const historyRoute = require("../routes/history");
const termsRoute = require('../routes/terms')
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
app.use("/api", stockRoute);
app.use("/api/history", historyRoute);
app.use("/api/terms", termsRoute);
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Running at ${port}`));
