const express = require("express");
const User = require("../model/User");
const routes = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const authMiddleware = require("../middleware/auth");
const {
  registerValidation,
  loginValidation
} = require("../validators/validation");
routes.get("/", (req, res) => {
  res.status(200).send({ msg: "Bem vindo a API do App Hemocare" });
});

routes.post("/register", async (req, res) => {
  const { error } = registerValidation(req.body);
  if (error) return res.status(400).send({ msg: error.details[0].message });
  const { email, name, password } = req.body;

  const emailExists = await User.findOne({ email });
  const hashedPassword = await hashPassword(password);

  if (emailExists) {
    res
      .status(400)
      .send({ msg: "Email já existe na base de dados. Tente fazer login." });
  } else {
    const user = new User({
      name,
      email,
      password: hashedPassword
    });
    const userJWT = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET, {
      expiresIn: "5h"
    });

    user.tokens = user.tokens.concat({ token: userJWT });
    try {
      await user.save().then(user => {
        res.status(200).send({ savedUser: user });
      });
    } catch (error) {
      res.status(400).send({ msg: error });
    }
  }
});

routes.post("/login", async (req, res) => {
  const { error } = loginValidation(req.body);
  if (error) return res.status(400).send({ msg: error.details[0].message });
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user)
    return res
      .status(400)
      .send({ msg: "Usuário não encontrado no banco de dados" });

  const validPass = await bcrypt.compare(password, user.password);
  if (!validPass) return res.status(400).send({ msg: "Senha incorreta." });

  // TODO - GERAR JWT de login
  const userJWT = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET, {
    expiresIn: "5h"
  });
  user.tokens = user.tokens.concat({ token: userJWT });
  user.save();
  res.status(200).send({ msg: "Logado com sucesso!", user: user });
});
routes.post("/forgotPassword", async (req, res) => {
  const { email } = req.body;
  if (!email)
    return res
      .status(400)
      .send({ msg: "Email requerido para redefinir senha." });
  await User.findOne({ email })
    .then(user => {
      const token = crypto.randomBytes(20).toString("hex");
      user.resetPasswordToken = token;
      user.resetPasswordExpires = Date.now() + 360000;
      user.save();
      res.status(200).send({ msg: "Email de recuperação enviado.", token });
    })
    .catch(error => {
      res.status(400).send({ msg: "Erro na redefinicão " + error.toString() });
      console.log("Erro na redefinição" + error.toString());
    });
});
routes.post("/resetPassword", async (req, res) => {
  const { email, token, newPassword } = req.body;

  const user = await User.findOne({ email });
  if (!user)
    return res
      .status(400)
      .send({ msg: "Credenciais do usuário não encontradas" });
  if (!user.resetPasswordToken === token)
    return res.status(400).send({
      msg: "Token informado não coincide com token gerado para redefinição"
    });
  if (!Date.now() < user.resetPasswordExpires)
    return res.status(400).send({
      msg: "Token expirado. Requeira um novo token na redefinição de senha"
    });

  user.password = await hashPassword(newPassword);
  await user.save().then(() => {
    res.status(200).send({ msg: "Senha atualizada com sucesso." });
  });
});

routes.get("/list", authMiddleware, async (req, res) => {
  try {
    const users = await User.find({});
    res.status(200).send({ users });
  } catch (error) {
    res.status(500).send({ msg: error });
  }
});
routes.post("/logout", authMiddleware, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(token => {
      return token.token !== req.token;
    });
    await req.user.save();
    res.status(200).send({ msg: "Usuario deslogado" });
  } catch (error) {
    res.send({ msg: error });
  }
});
routes.post("/logoutAll", authMiddleware, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.status(200).send({ msg: "Usuario deslogado de todas as sessões" });
  } catch (error) {
    res.status(500).send();
  }
});
//utils
async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
}
module.exports = routes;
