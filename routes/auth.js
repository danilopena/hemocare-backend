const express = require("express");
const User = require("../model/User");
const router = express.Router();
const { registerValidation, loginValidation } = require("../validation");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require('crypto')
const mailer = require('nodemailer')


router.post("/register", async (req, res) => {
  const { error } = registerValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  //check dupliticy
  const emailExists = await User.findOne({ email: req.body.email });
  if (emailExists) return res.status(400).send("Email ja existe");
  // hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);
  
  //const {name, email,password} = req.body,

  //new user
  const user = new User({
    // use destructuring
    name: req.body.name,
    email: req.body.email,
    password: hashedPassword
  });
  try {
    const savedUser = await user.save();
    res.send({ user: user._id });
  } catch {
    console.log(err);
    res.status(400).send(err);
  }
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
  const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET);
  res.header("auth-token", token).send(token);
});


// forgot-password
router.post('/forgotPassword', (req, res, next) => {
  const {email} = req.body
  
  if(email === ''){
    res.json('email required')
  }
  User.findOne({
    where: {
      email: email
    }
  }).then(user => {
    if(user === null){
      console.log('email not in database');
      res.json('email not in db')
      
    }else{
      const token = crypto.randomBytes(20).toString('hex')
      console.log(token);
      user.update({
        resetPasswordToken: token,
        resetPasswordExpires: new Date.now() + 360000
      })
      const transporter = mailer.createTransport({
        service: 'gmail',
        auth: {
          user: `${process.env.EMAIL_ADDRESS}`,
          pass: `${process.env.EMAIL_PASSWORD}`
        }
      })
      const mailOptions = {
        from: 'emailderecovery@gmail.com',
        to: `${email}`,
        subject: 'Redefinição de senha',
        text: 'Vc esta recebendo este link porque voce ou outra pessoa requisitou que a senha do email seja resetada'+
        'Clique no link abaixo ou cole na barra de endereço do browser para completar o processo de redefinição'+
        'http://localhost:3000/resetPassword/${token}'+
        'Se você não solicitou essa redefinição, por gentileza ignorar. Sua senha continuará a mesma'
      }
      transporter.sendMail(mailOptions, function(err, response){
        if(err){
          console.log(err);
        } else{
          console.log(response);
        res.status(200).json('email de recovery enviado')
        
        }
        
        
      })
    }
  })

})


module.exports = router;
