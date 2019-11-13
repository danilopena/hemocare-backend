const express = require("express");
const History = require("../model/History");
const getHours = require("date-fns/getHours");
const getMinutes = require("date-fns/getMinutes");
const parseISO = require("date-fns/parseISO");
const format = require("date-fns/format");
const router = express.Router();
const startOfMonth = require('date-fns/startOfMonth')
const endOfMonth = require('date-fns/endOfMonth')
const Op = require('mongoose')
router.post("/create", async (req, res) => {
  const {
    typeInfusion,
    dosage,
    recurring,
    user,
    infusionDateRaw,
    infusionTimeRaw
  } = req.body;

  const infusionDate = format(parseISO(infusionDateRaw), "dd/MM/yyyy");
  const infusionTime = format(parseISO(infusionTimeRaw), "dd/MM/yyyy HH:mm");

  const createdHistory = new History({
    typeInfusion,
    dosage,
    recurring,
    user,
    infusionDate,
    infusionTime
  });
  try {
    await createdHistory
      .save()
      .then(history => {
        return res.status(200).json({ msg: "Histórico criado " });
      })
      .catch(error => {
        return res.status(400).json({
          msg: `Erro ao adicionar infusão no histórico>> ${error}`,
          payload: { infusionDate, infusionTime }
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

router.get('/historyFromMonth',async (req, res)=>{
    const {date} = req.headers;
    const [mes, ano] = date.split('/')
    
    //meses: janeiro = 0 dezembro = 11
    const startDate = new Date(parseInt(ano), ((parseInt(mes))-1), 1)
    //end dateS
    const endDate = endOfMonth(startDate)        
    console.log(startDate);
    console.log(endDate);
    const infusionsInRange = await History.find({ infusionDate: { $gte: startDate, $lte: endDate } })
    console.log(infusionsInRange);
    
    if(infusionsInRange.length === 0){
        return res.status(400).json({msg: 'Não existem infusões registradas para o período consultado.'})
    }
  
    return res.status(200).json({msg: 'Sucesso!', payload: infusionsInRange})


})
module.exports = router;
