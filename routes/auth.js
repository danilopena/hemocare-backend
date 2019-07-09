const express = require('express')
const User = require('../model/User')
const router = express.Router()

router.post('/register', async (req,res)=> {
  const user = new User({
    // use destructuring
    name: req.body.name,
    email: req.body.email,
    password: req.body.password
  })
  try{
    const savedUser = await user.save()
  }catch{
    res.status(400).send(err)
  }
})


 
module.exports = router