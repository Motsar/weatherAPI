const express = require('express')
const app = express()
require('dotenv').config();

let port = process.env.PORT || 3000

//import routes

const weatherRoute = require('./routes/weatherConditions');

//route middlewares

app.use(express.json());

app.use('/conditions',weatherRoute);



//express server

app.listen(port,()=>{console.log('app listening on port '+ port)})