//import { PORT } from './constants.js'
const express = require('express')
const constants = require('./constants')
const db = require('./modules/dbConnection')
const bp = require('body-parser')
const authRouter = require('./handlers/authHandler')
const cors = require('cors')
// Server config.
const app = express()
app.use(bp.json())
app.use(bp.urlencoded({extended:true}))
app.use(cors())
//DB connection test.
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", function () {
  console.log("Connected successfully");
});
//Routes
app.use("/auth",authRouter) //authorizaion
app.listen(constants.PORT)
