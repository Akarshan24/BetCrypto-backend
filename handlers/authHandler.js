const express = require('express')
const loginModel = require('../models/loginModel')
const userModel = require('../models/userModel')
const authUtils = require('../utils/authUtils')
const router = express.Router()

router.post("/login",async(req,res)=>{
    console.log(req.body)
        const response = await userModel.findOne({
            alias: req.body.alias,
            password: req.body.password
        })
        if(response){
            const jwt = authUtils.getJWT(req.body.alias, response.email)
            res.json({status: 'ok', token: jwt})
        }
            
        else
            res.json({status: 'failed'})
    //res.send(loginRequest)
})

router.post("/register",async (req,res)=>{
    console.log("New Registration Request:",req.body)
//     if(!authUtils.isUserRegistrationRequestValid(req.body))
//         res.status(500).send("Invalid Registration Request")
//    // Check if user already exists
//    const userIsPresent = async () =>await authUtils.isUserPresent(req.body)
//    if(userIsPresent)
//         res.status(500).send("Alias or email already exist!")
//    // Pass flow to service layer.
    try{
        const user = await userModel.create({
            alias: req.body.alias,
            email: req.body.email,
            password: req.body.password,
            paymentPasscode: req.body.passcode,

        })
    }catch(err){res.send(err)}

    res.send({status: 'ok'})
})

router.post("/verify-email", async(req,res)=>{}) //ToDo

router.post("/logout", async(req,res)=>{
    
})
module.exports = router