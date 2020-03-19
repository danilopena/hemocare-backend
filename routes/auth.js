/* eslint-disable no-underscore-dangle */
const express = require('express');

const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const mailer = require('nodemailer');

let myJwtToken = '';
const path = require('path');
const {
  isBefore,
} = require('date-fns');
const User = require('../model/User');

const {
  registerValidation,
  loginValidation,
  passwordValidation,
} = require('../validation');
// Funcoes
function sendMail(email, token, res) {
  const transporter = mailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  const mailOptions = {
    from: 'hemocareapp@gmail.com',
    to: `${email}`,
    context: { token },
    subject: 'Redefinição de senha',
    text:
      'Voce esta recebendo este link porque voce ou outra pessoa requisitou que a senha do email seja resetada\n'
      + 'Clique no link abaixo ou cole na barra de endereço do browser para completar o processo de redefinição \n'
      + `https://hemocare-backend.herokuapp.com/api/user/reset/?token=${token}&email=${email}`
      + '\n\n Se você não solicitou essa redefinição, por gentileza ignorar. Sua senha continuará a mesma',
  };

  transporter.sendMail(mailOptions, (err, response) => {
    if (err) {
      console.log(err);
    } else {
      console.log(response);
      res.status(200).json({ msg: 'email de recovery enviado', token });
    }
  });
}

async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
}

router.post('/register', async (req, res) => {
  const { error } = registerValidation(req.body);
  if (error) return res.status(400).json({ msg: error.details[0].message });

  // check dupliticy
  const emailExists = await User.findOne({ email: req.body.email });
  if (emailExists) {
    return res.status(400).json({
      msg: 'Email já existe na nossa base de dados. Tente redefinir a senha',
    });
  }
  // hash password
  const { password } = req.body;
  const hashedPassword = await hashPassword(password);

  // const {name, email,password} = req.body,

  const {
    name, email, pathology, agreeToTerms,
  } = req.body;

  // new user
  const user = new User({
    // use destructuring
    name,
    email,
    password: hashedPassword,
    pathology,
    agreeToTerms,
  });
  try {
    const savedUser = await user.save();
    myJwtToken = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET, {
      expiresIn: 360000,
    });
    savedUser.authToken = myJwtToken;
    savedUser.save();
    return res
      .header('auth-token', myJwtToken)
      .json({ jwt_Token: myJwtToken, id: savedUser.id });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      msg: 'Erro ao registrar usuário. Tente novamente em alguns momentos.',
    });
  }
});

router.get('/', async (req, res) => res.status(200).json({ msg: 'Bem vindo a API do Hemocare' }));

// login
router.post('/login', async (req, res) => {
  // validate data
  const { error } = loginValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  const { email, password } = req.body;
  console.log(`${email} e pass: ${password}"`);
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({
      msg:
        'Suas credenciais não foram encontradas no nosso servidor. Revise os dados de login.',
    });
  }
  console.log(`Minha pass ${user.password} & req pass ${password}`);
  // pass is correct?
  const validPass = await bcrypt.compare(password, user.password);
  if (!validPass) { return res.status(400).send('Acho que você esqueceu sua senha.'); }

  // create and assign token jwt
  myJwtToken = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET, {
    expiresIn: 360000,
  });
  user.authToken = myJwtToken;
  user.save();
  // console.log(myJwtToken);

  return res
    .header('auth-token', myJwtToken)
    .json({ jwt_Token: myJwtToken, id: user.id });
});

// forgot-password
router.post('/forgotPassword', async (req, res) => {
  const { email } = req.body;
  console.log(`Email> ${email}`);

  if (email === '') {
    res.json({ msg: 'É necessário informar um email. Tente novamente... ' });
  }
  await User.findOne({
    email,
  }).then((user) => {
    // console.log(user);

    if (user === null) {
      res.json({
        msg:
          'Suas credenciais não foram encontradas no nosso banco de dados. Tente novamente.',
      });
    } else {
      const token = crypto.randomBytes(20).toString('hex');
      // user.resetPasswordToken = token;
      // user.resetPasswordExpires = Date.now() + 3600000;
      const now = new Date();
      now.setHours(now.getHours() + 2);
      User.findByIdAndUpdate(user.id, {
        $set: {
          resetPasswordToken: token,
          resetPasswordExpires: now,
        },
      }).then((response) => console.log(response));

      // call mail
      sendMail(email, token, res);
    }
  });
});

// forgot password
router.post('/resetPassword', async (req, res) => {
  const { error } = passwordValidation(req.body);
  if (error) return res.status(400).json({ msg: error.details[0].message });
  const { password, email, token } = req.body;
  console.log(`No reset: ${email} and ${token} `);
  let user;
  try {
    user = await User.findOne({ email });
    if (!user) {
      return res.status(400).send({
        msg:
          'Não existe usuário associado a esse email em nosso banco de dados.',
      });
    }
    console.log(user.resetPasswordToken);
    if (token !== user.resetPasswordToken) {
      // it do not records resetToke on mongo db atlas
      return res.status(400).send({
        msg:
          'Não foi possível encontrar esse token de redefinição. Tente novamente.',
      });
    }


    // se agora nao for antes da data de expiracao do token
    if (!isBefore(Date.now(), user.resetPasswordExpires)) {
      return res.status(400).json({
        msg:
          'Esse token de redefinição está expirado. Tente gerar um novo token. ',
      });
    }


    const newPassword = await hashPassword(password);
    user.password = newPassword;
    await user
      .save()
      .then(() => res.status(200).send({ msg: 'Usuário atualizado com sucesso.' }));
  } catch (err) {
    res.status(400).json({ msg: `Falha ao atualizar o usuário ${err}` });
  }
});

router.post('/logoff', async (req, res) => {
  // res.status(200).send(myJwtToken);
  const { email } = req.body;

  try {
    await User.find({ email }).then((user) => {
      if (!user) {
        return res.status(401).json({
          msg: 'Credenciais não encontradas no nosso banco de dados.',
        });
      }
      jwt.verify(user.authToken, process.env.TOKEN_SECRET);
    });
    res.status(200).json({ msg: 'Usuário deslogado com sucesso.' });
  } catch (error) {
    res.status(400).json({
      msg: 'Erro ao deslogar o usuário. Tente novamente em alguns instantes',
    });
  }
});

router.get('/reset', (req, res) => {
  res.sendFile(path.resolve(__dirname, '..', 'public'));
});


module.exports = router;
