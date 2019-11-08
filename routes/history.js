const express = require("express");
const History = require("../model/History");
const getHours = require('date-fns/getHours')
const getMinutes = require('date-fns/getMinutes')
const parseISO = require('date-fns/parseISO')
const format = require('date-fns/format')
const router = express.Router();

router.post("/create", async (req, res) => {
  const { typeInfusion, dosage, recurring, user, date, hour } = req.body;
  const infusionDate = format(parseISO(date), 'dd/MM/yyyy')
  const infusionTime = format(parseISO(hour), 'HH:mm')
  console.log(infusionDate)
  console.log(infusionTime)
  const createdHistory = new History({ typeInfusion, dosage, recurring, user, infusionDate, infusionTime });
  try {
    await createdHistory
      .save()
      .then(history => {
        console.log(history);
        console.log(createdHistory);
        return res.status(200).json({ msg: "Historico criado " });
      })
      .catch(error => {
        return res
          .status(400)
          .json({ msg: `Erro ao adicionar infusão no histórico>> ${error}` });
      });
  } catch (error) {
    return res
      .status(400)
      .json({ msg: `Erro ao salvar infusão no histórico>> ${error}` });
  }
});

router.get("/getHistory", async (req, res) => {
  const { userId } = req.query;
  let historyFromUser;
  try {
    historyFromUser = await History.find()
      .where({ user: userId })
      .populate("user");
  } catch (error) {
    return res.status(400).json({ msg: `Erro ao buscar histórico ${error}` });
  }
  return res.status(200).json({ historyFromUser });
});
module.exports = router;
