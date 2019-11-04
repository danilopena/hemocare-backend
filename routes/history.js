const express = require("express");
const History = require("../model/History");
const router = express.Router();

router.post("/create", async (req, res) => {
  const { typeInfusion, dosage, recurring, user } = req.body;
  const createdHistory = new History({ typeInfusion, dosage, recurring, user });
  try {
    await createdHistory
      .save()
      .then(history => {
        console.log(history);
        console.log(createdHistory);
        return res.status(200).json({ msg: "Historico criado " });
      })
      .catch(error => {
        console.log(error);
      });
  } catch (error) {}
});

router.get("/getHistory", async (req, res) => {
  const { userId } = req.query;
  const historyFromUser = await History.find()
    .where({ user: userId })
    .populate("user");
  console.log(historyFromUser);
  return res.status(200).json({ msg: "SUCCESS@" });
});
module.exports = router;
