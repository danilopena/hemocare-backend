const express = require("express");
const User = require("../model/User");
const router = express.Router();
const {
  stockValidation,
  changeStockValidation
} = require("../stockValidations");

router.post("/stock/create", async (req, res) => {
  const validationResult = stockValidation(req.body);
  if (validationResult.error !== null) {
    return res
      .status(400)
      .json({ msg: validationResult.error.details[0].message });
  }
  const { userId } = req.query;
  try {
    const { initialStock, dosage } = req.body;
    const user = await User.findById(userId);
    if (user) {
      user.initialStock = initialStock;
      user.dosage = dosage;
    }
    user.save();
    console.log(user);

    return res.status(200).json({ msg: "Estoque criado com sucesso" });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ msg: error });
  }
});

router.post("/stock/add", async (req, res) => {
  const validationResult = changeStockValidation(req.body);
  if (validationResult.error !== null)
    return res
      .status(400)
      .json({ msg: validationResult.error.details[0].message });
  const { userId } = req.query;
  const { quantity } = req.body;
  try {
    const user = await User.findById(userId);
    if (user) {
      user.initialStock += quantity;
    }
    user.save();
  } catch (error) {
    return res.status(400).json({ msg: error });
  }
  return res
    .status(200)
    .json({ msg: `Quantidade ${quantity} adicionada com sucesso` });
});
router.get("/stock/getStock", async (req, res) => {
  const { userId } = req.query;
  console.log(userId);
  const user = await User.findById(userId);

  try {
    if (user) {
      const quantity = user.initialStock;
      res.status(200).json({ quantity: quantity });
    } else {
      res.status(400).json({ msg: "Erro no retorno" });
    }
  } catch (error) {
    return res.status(400).json({ msg: error });
  }
});

router.post("/stock/subtract", async (req, res) => {
  const validationResult = changeStockValidation(req.body);
  if (validationResult.error !== null)
    return res
      .status(400)
      .json({ msg: validationResult.error.details[0].message });
  const { userId } = req.query;
  const { quantity } = req.body;
  try {
    const user = await User.findById(userId);
    if (user) {
      user.initialStock -= quantity;
    }
    user.save();
  } catch (error) {
    return res.status(400).json({ msg: error });
  }
  return res
    .status(200)
    .json({ msg: `Quantidade ${quantity} removida com sucesso` });
});

module.exports = router;
