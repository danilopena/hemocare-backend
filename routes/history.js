const express = require("express");
const router = express.Router();

const History = require("../model/History");
const User = require("../model/User");
const {zonedTimeToUtc} =  require('date-fns-tz');
const format = require("date-fns/format");
const subHours = require("date-fns/subHours");
const parseISO = require("date-fns/parseISO");
const addHours = require('date-fns/addHours')
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
    recurring: recurring ? recurring : false,
    user,
    comment: comment ? comment : '',
    date: finalDate
  });

  try {
    // verificando se o user tem estoque deduzivel

    const userData = await User.findById(user);
    if(userData.initialStock < dosage ){
      return res.status(400).json({msg: 'Seu estoque não permite essa infusão'})
    }
    userData.initialStock -= parseInt(dosage);
    userData.infusions += parseInt(dosage);
    await userData.save();
    console.log(userData.percentageUsed)

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
      .where({ user: userId }).sort({ date: 'desc' })
  } catch (error) {
    return res.status(400).json({ msg: `Erro ao buscar histórico ${error}` });
  }
  console.log(historyFromUser)
  return res.status(200).json({ historyFromUser });
});

router.get("/historyFromMonth", async (req, res) => {
  console.log(req.body);
  const { startDate, endDate } = req.body;
  // const [mes, ano] = date.split("/");

  //dd/MM/yyyy
  console.log(

      `
      ${startDate}
      ${endDate}
      
      `
  )
  const[startDia, startMes, startAno] = startDate.split('/')
  const finalStartDate = new Date(startAno, startMes-1, startDia, 0, 0, 0)

  const [endDia, endMes, endAno] = endDate.split('/')
  const finalEndDate = new Date(endAno, endMes-1, endDia, 23, 59,59)

  const utcStart = subHours(zonedTimeToUtc(finalStartDate, 'America/Sao_Paulo'), 3);
  const utcEnd = subHours(zonedTimeToUtc(finalEndDate, 'America/Sao_Paulo'), 3);


  console.log(utcStart)
  console.log(addHours(utcEnd, 1));
  // //meses: janeiro = 0 dezembro = 11
  // const startDate = new Date(parseInt(ano), parseInt(mes)-1, 1);
  // //end dateS
  // const endDate = endOfMonth(startDate);
  const infusionsInRange = await History.find({
    date: { $gte: utcStart, $lte: addHours(utcEnd, 1) }
  })
  console.log(infusionsInRange)
  if (infusionsInRange.length === 0) {
    return res.status(400).json({
      msg: "Não existem infusões registradas para o período consultado."
    });
  }

  return res.status(200).json({ msg: "Sucesso!", payload: infusionsInRange });
});
module.exports = router;
