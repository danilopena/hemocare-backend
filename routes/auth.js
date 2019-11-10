const express = require("express");
const User = require("../model/User");
const router = express.Router();
const { registerValidation, loginValidation } = require("../validation");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const mailer = require("nodemailer");
let myJwtToken = "";

router.post("/register", async (req, res) => {
  const { error } = registerValidation(req.body);
  if (error) return res.status(400).json({ msg: error.details[0].message });

  //check dupliticy
  const emailExists = await User.findOne({ email: req.body.email });
  if (emailExists) return res.status(400).send("Email ja existe");
  // hash password
  const { password } = req.body;
  const hashedPassword = await hashPassword(password);

  //const {name, email,password} = req.body,

  const { name, email, pathology, agreeToTerms } = req.body;
  console.log(pathology);

  //new user
  const user = new User({
    // use destructuring
    name,
    email,
    password: hashedPassword,
    pathology,
    agreeToTerms
  });
  try {
    const savedUser = await user.save();
    res.send({ user: savedUser });
  } catch {
    console.log(err);
    res.status(400).json({ msg: err });
  }
});

router.get("/", async (req, res) => {
  return res.status(200).json({ msg: "Bem vindo a API do Hemocare" });
});

//login
router.post("/login", async (req, res) => {
  // validate data
  const { error } = loginValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).send("Email does not exists in database");
  // pass is correct?
  const validPass = await bcrypt.compare(req.body.password, user.password);
  if (!validPass) return res.status(400).send("Invalid Password");

  // create and assign token jwt
  myJwtToken = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET, {
    expiresIn: 360000
  });
  user.authToken = myJwtToken;
  user.save();
  //console.log(myJwtToken);

  return res.header("auth-token", myJwtToken).json({ jwt_Token: myJwtToken, id: user.id });
});

// forgot-password
router.post("/forgotPassword", async (req, res, next) => {
  const { email } = req.body;
  console.log(`Email> ${email}`);

  if (email === "") {
    res.json("email required");
  }
  await User.findOne({
    email
  }).then(user => {
    //console.log(user);

    if (user === null) {
      console.log("email not in database");
      res.json("email not in db");
    } else {
      const token = crypto.randomBytes(20).toString("hex");
      console.log(`Token de recovery eh> ${token}`);
      user.resetPasswordToken = token;
      user.resetPasswordExpires = Date.now() + 3600000;
      user.save();

      // call mail
      sendMail(email, token, res);
    }
  });
});
router.post("/resetPassword", async (req, res) => {
  const { email, token, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).send({ error: "User not found" });
    if (token !== user.resetPasswordToken) {
      // it do not records resetToke on mongo db atlas
      console.log(`Token> ${token} && Reset Token> ${user.resetPasswordToken}`);
      return res.status(400).send({ error: "Invalid token" });
    }

    const rightNow = Date.now();
    if (rightNow > user.resetPasswordExpires)
      return res
        .status(400)
        .send({ error: "Token expired, generate a new one" });

    user.password = await hashPassword(password);
    await user
      .save()
      .then(() =>
        res.status(200).send({ msg: "User password updated successfuly!" })
      );
  } catch (error) {
    res.status(400).send("Not found");
  }
});
router.get('/terms', async (req, res)=> {
  return res.status(200).json({"texto": "Isenção de responsabilidade médica do aplicativo\n" +
        "Isenção de responsabilidade médica\n" +
        "Revisado 10/11/2019\n" +
        "\n" +
        "Nenhum conselho\n" +
        "Este aplicativo (\"App)\" fornece apenas informações, não é um conselho médico ou de tratamento e não pode ser tratado como tal pelo usuário. \n" +
        " \n" +
        "Como tal, este App não pode ser invocado para fins de diagnóstico médico ou como uma recomendação para atendimento médico ou tratamento. As informações sobre este App não é um substituto para aconselhamento médico profissional, diagnóstico ou tratamento. \n" +
        "Todo o conteúdo, incluindo texto, gráficos, imagens e informações, contidos ou disponíveis através deste aplicativo é apenas para fins de informação geral\n" +
        "\n" +
        "Assessoria e Assistência Médica Profissional\n" +
        "É altamente recomendável que você confirme qualquer informação obtida  através deste App com seu médico ou outro profissional de saúde e revise todas as informações referentes a qualquer condição médica ou tratamento com seu médico ou outro profissional de saúde.\n" +
        "\n" +
        "Sem confiança\n" +
        "Você nunca deve confiar em qualquer informação obtida usando este aplicativo para qualquer diagnóstico ou recomendação para tratamento médico. VOCÊ NUNCA DEVE CONFIAR NAS INFORMAÇÕES RECEBIDAS DESTE APLICATIVO COMO ALTERNATIVO AO CONSELHO MÉDICO DE SEU MÉDICO OU OUTRO PROFISSIONAL DE SAÚDE.\n" +
        "\n" +
        "Você nunca deve dispensar aconselhamento médico profissional ou demora procurando tratamento médico como resultado de qualquer informação que você tenha visto ou acessado através deste aplicativo. SE VOCÊ TIVER ALGUMAS QUESTÕES ESPECÍFICAS SOBRE QUALQUER ASSUNTO MÉDICO, VOCÊ DEVE CONSULTAR SEU MÉDICO OU OUTRO PROFISSIONAL DE SAÚDE. Se você acha que pode estar sofrendo de qualquer condição médica, você deve procurar atenção médica imediata.\n" +
        "\n" +
        "Sem garantia\n" +
        "As informações fornecidas por este aplicativo são fornecidas \"como estão\", sem quaisquer representações ou garantias, expressas ou implícitas. O Hemocare não faz representações ou garantias em relação ao médico ou outras informações contidas neste App.\n" +
        "\n" +
        "O Hemocare não garante que:\n" +
        "- As informações fornecidas por este aplicativo estarão constantemente disponíveis ou disponíveis a todos;\n" +
        "ou\n" +
        "- As informações fornecidas por este aplicativo são completas, verdadeiras, precisas, atualizadas ou não enganosas.\n" +
        "\n" +
        "O Hemocare NÃO SE RESPONSABILIZA POR QUALQUER RECOMENDAÇÃO, CURSO DE TRATAMENTO, DIAGNÓSTICO OU QUALQUER OUTRA INFORMAÇÃO, SERVIÇOS OU PRODUTOS QUE OBTER ATRAVÉS DO USO DESTE APLICATIVO.\n" +
        "\n" +
        "Ao usar o aplicativo e marcar a caixa de seleção, você reconheceu que:\n" +
        "- VOCÊ LEU O ENTENDER ESTA ISENÇÃO MÉDICA.\n" +
        "- VOCÊ CONCORDA COM ESTA ISENÇÃO MÉDICA.\n" +
        "- VOCÊ CONCORDA EM SER LEGALMENTE INCORPORADO POR ESTA ISENÇÃO MÉDICA, QUE TERÁ EFEITO IMEDIATAMENTE AO CLICAR NO CHECKBOX ABAIXO.\n" +
        "\n" +
        "SE VOCÊ NÃO CONCORDAR EM SER LEGALMENTE INCORPORADO POR ESSA ISENÇÃO MÉDICA, VOCÊ NÃO PODE ACESSAR O APLICATIVO, REGISTRAR O APLICATIVO SOB O SEU NOME OU USAR O APLICATIVO."})
})
router.post("/logoff", async (req, res) => {
  //res.status(200).send(myJwtToken);
  const { email } = req.body;
  console.log(email);

  try {
    await User.find({ email }).then(user => {
      if (!user) return res.status(401).send({ error: "User not found" });
      jwt.verify(user.authToken, process.env.TOKEN_SECRET);
    });
    res.status(200).send({ msg: "User logoff succeeded" });
  } catch (error) {
    console.log(error);
  }
});

function sendMail(email, token, res) {
  const transporter = mailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
  const mailOptions = {
    from: "hemocareapp@gmail.com",
    to: `${email}`,
    context: { token },
    subject: "Redefinição de senha",
    text:
      "Vc esta recebendo este link porque voce ou outra pessoa requisitou que a senha do email seja resetada" +
      "Clique no link abaixo ou cole na barra de endereço do browser para completar o processo de redefinição " +
      `https://hemocare-backend-new.herokuapp.com/api/user/resetPassword/${token}` +
      " Se você não solicitou essa redefinição, por gentileza ignorar. Sua senha continuará a mesma"
  };
  transporter.sendMail(mailOptions, function(err, response) {
    if (err) {
      console.log(err);
    } else {
      console.log(response);
      res.status(200).json({ msg: "email de recovery enviado", token });
    }
  });
}

async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
}

module.exports = router;
