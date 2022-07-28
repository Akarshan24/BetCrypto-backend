const express = require('express')
const { changePassword, verifyToken, loginUser, registerUser, verifyEmail, isUserPresent, getUserAndSendCode } = require('../service/authService')
const { isUserRegistrationRequestValid } = require('../utils/authUtils')
const router = express.Router()
const { OK, NOT_FOUND, BAD_REQUEST, UNAUTHORIZED, FORBIDDEN, INTERNAL_ERROR } = require('../constants');
router.post("/login", async (req, res) => {
    console.log("Login Request: ", req.body)
    const response = await loginUser(req.body.alias, req.body.password)
    return res.json(response);
    //res.send(loginRequest)
})

router.post("/register", async (req, res) => {
    console.log("New Registration Request:", req.body)
    if (!isUserRegistrationRequestValid(req.body))
        return res.json({ status: BAD_REQUEST, message: 'Invalid Request' });
    // Check if user already exists
    const duplicate = await isUserPresent(req.body);
    if (duplicate)
        return res.json({ status: INTERNAL_ERROR, message: 'Alias/Email already registered.' });
    // Pass flow to service layer.
    const response = await registerUser(req.body);
    //await createAndSaveWallets(req.body.alias);
    res.json(response);
})

router.post("/verify-email", async (req, res) => {
    console.log("Email verification request:", req.body);
    const response = await verifyEmail(req.body.alias, req.body.code);
    console.log("Code verification:", response);
    if (response) {
        res.send({ status: OK });
    }
    res.json({ status: INTERNAL_ERROR });
})
router.post("/send-verification-code", async (req, res) => {
    console.log("Verification Code Request:", req.body);
    const response = await getUserAndSendCode(req.body.alias);
    res.json(response);
})
router.post("/change-password", async (req, res) => {
    console.log("Password Change Request:", req.body);
    const isLoggedIn = verifyToken(req.headers['x-access-token']);
    if (isLoggedIn) {
        const response = await changePassword(req.body.alias, req.body.password);
        return res.json(response);
    } else
        res.send({ status: FORBIDDEN });
})

module.exports = router