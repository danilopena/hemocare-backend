const express = require('express')
const app = express()
const dotenv = require('dotenv')
const mongoose = require('mongoose')

dotenv.config()

//connect 
mongoose.connect(process.env.DB_CONNECT, 
{useNewUrlParser: true},
()=> console.log('DB connection'))

app.use(express.json())
 

const authRoute = require('../routes/auth')

// middleware
app.use('/api/user', authRoute)



app.listen(3000, () => console.log('Running at 3000'))