//import { PORT } from './constants.js'
const express = require('express')
const constants = require('./constants')
const db = require('./modules/dbConnection')
const bp = require('body-parser')
const authRouter = require('./routes/authRoute')
const tokenRouter = require('./routes/tokenRoute');
const footballRouter = require('./routes/footballRoute');
const cors = require('cors')
// Server config.
const app = express()
app.use(bp.json())
app.use(bp.urlencoded({ extended: true }))
app.use(cors({
  origin: '*'
}))
//DB connection test.
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", function () {
  console.log("Connected successfully");
});
//Routes
app.use("/auth", authRouter) //authorizaion
app.use('/token', tokenRouter) //operations related to crypto tokens
app.use('/football', footballRouter)
app.listen(constants.PORT)
