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
