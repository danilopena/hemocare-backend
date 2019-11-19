const express = require("express");
const router = express.Router();

const History = require("../model/History");
const User = require("../model/User");

const format = require("date-fns/format");
const parse = require("date-fns/parse");
const parseISO = require("date-fns/parseISO");
const endOfMonth = require("date-fns/endOfMonth");

router.post("/create", async (req, res) => {
  const { typeInfusion, dosage, recurring, user, comment, date } = req.body;
  const [data, hora] = date.split(' ')
  const [dia, mes, ano] = data.split('/')
  const [horas, minutos, segundos] = hora.split(':')

  const finalDate = new Date(ano, mes-1, dia, horas ,minutos, segundos);
  console.log(finalDate)


  const createdHistory = new History({
    typeInfusion,
    dosage,
    recurring,
    user,
    comment,
    date: finalDate
  });

  try {
    // verificando se o user tem estoque deduzivel

    const userData = await User.findById(user);
    console.log(userData)
    if(userData.initialStock <= dosage ){
      return res.status(400).json({msg: 'Seu estoque não permite essa infusão'})
    }
    userData.initialStock -= dosage;
    userData.save();
    await createdHistory
      .save()
      .then(history => {
        return res.status(200).json({
          msg: "Histórico criado ",
          history
        });
      })
      .catch(error => {
        return res.status(400).json({
          msg: `Erro ao adicionar infusão no histórico>> ${error}`
        });
      });
  } catch (error) {
    return res.status(400).json({
      msg: `Erro ao salvar infusão no histórico>> ${error}`
    });
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

router.get("/historyFromMonth", async (req, res) => {
  console.log(req.body);
  const { date } = req.body;
  const [mes, ano] = date.split("/");

  //meses: janeiro = 0 dezembro = 11
  const startDate = new Date(parseInt(ano), parseInt(mes)-1, 1);
  //end dateS
  const endDate = endOfMonth(startDate);

  console.log(startDate)
  console.log(endDate)
  //timezone treating: const znDate = zonedTimeToUtc(parsedDate, 'America/Sao_Paulo');

  const infusionsInRange = await History.find({
    infusionDate: { $gte: startDate, $lte: endDate }
  });

  if (infusionsInRange.length === 0) {
    return res.status(400).json({
      msg: "Não existem infusões registradas para o período consultado."
    });
  }

  return res.status(200).json({ msg: "Sucesso!", payload: infusionsInRange });
});
module.exports = router;
