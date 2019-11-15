const express = require("express");
const History = require("../model/History");

const format = require('date-fns/format')
const parse = require('date-fns/parse')
const parseISO = require('date-fns/parseISO')
const router = express.Router();
const endOfMonth = require("date-fns/endOfMonth");
router.post("/create", async (req, res) => {

  const {
    typeInfusion,
    dosage,
    recurring,
    user,
      comment,
    date
  } = req.body;
  console.log(`
     ${typeInfusion}
     ${dosage}
     ${recurring}
     ${user}
     ${comment}
     ${date}
   `)


  console.log(`this is date: ${date}`)
  console.log(comment)
  return res.status(200).json({date});
  // const [data, hora] = cuntAssDate.split(' ')
  // const [dia, mes, ano] = data.split('/')
  // const [horas, minuto, segundo] = hora.split(':')
  // console.log(`
  //   ${dia}
  //   ${mes}
  //   ${ano}
  //   ${horas}
  //   ${minuto}
  //   ${segundo}
  // `)
  // const finalFuckingDate = new Date(ano,mes-1,dia,horas, minuto,segundo)
  // console.log(format(finalFuckingDate, 'dd/MM/yyyy HH:mm:ss'))
return;
  const createdHistory = new History({
    typeInfusion,
    dosage,
    recurring,
    user,
    comment,
    date,
  });

  try {
    await createdHistory
      .save()
      .then(history => {
        return res.status(200).json({ msg: "Histórico criado " });
      })
      .catch(error => {
        return res.status(400).json({
          msg: `Erro ao adicionar infusão no histórico>> ${error}`
        });
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

router.get("/historyFromMonth", async (req, res) => {
  console.log(req.body);
  const { date } = req.body;
  const [mes, ano] = date.split("/");

  //meses: janeiro = 0 dezembro = 11
  const startDate = new Date(parseInt(ano), parseInt(mes) - 1, 1);
  //end dateS
  const endDate = endOfMonth(startDate);

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
