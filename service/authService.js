const emailClient = require('nodemailer');
const jwt = require('jsonwebtoken');
const { getJWT, generateVerificationCode } = require('../utils/authUtils');
const { updateOneUser, getUser, createUser, findOneUser } = require('../dao/userDao');
const { OK, NOT_FOUND, BAD_REQUEST, UNAUTHORIZED, FORBIDDEN, INTERNAL_ERROR } = require('../constants');
const { getPublicKeys } = require('../dao/walletDao');
const { getBTCBalance } = require('../modules/bitcoin');
const { getWalletBalances } = require('./tokenService');

const updateVerificationCode = async (user, code) => {
    user.emailVerificationCode = code;
    await updateOneUser({ email: user.email }, user);
};
const updateIsEmailVerified = async (user) => {
    user.isEmailVerified = true;
    await updateOneUser({ email: user.email }, user);
};
const sendEmailVerificationCode = async (user) => {
    const code = generateVerificationCode();
    let transporter = emailClient.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: 'betcryptodev@gmail.com',
            pass: 'yawfwwjvlapuxzih'
        }
    });
    let mailOptions = {
        from: '"BetCrypto Developer Account" <betcryptodev@gmail.com>', // sender address
        to: user.email, // list of receivers
        subject: 'Email verification code for user registration', // Subject line
        text: code, // plain text body
    };

    await transporter.sendMail(mailOptions, async (error, info) => {
        if (error) {
            console.log("Error while sending email:", error);
        }
        else {
            await updateVerificationCode(user, code)
            console.log('Message %s sent: %s', info.messageId, info.response);
        }
    });
};
const loginUser = async (alias, password) => {
    const user = await findOneUser({ alias: alias, password: password });
    const keys = await getPublicKeys(alias);
    console.log(keys);
    if (user && user.isEmailVerified) {
        const jwt = getJWT(user.alias, user.email, keys.data.bitcoin.publicKey);
        return ({ status: OK, message: jwt });
    }
    else if (user && !user.isEmailVerified) {
        return ({ status: FORBIDDEN });
    }
    return ({ status: NOT_FOUND });

};
const isUserPresent = async (user) => {
    const searchByAlias = await getUser({ alias: user.alias });
    const searchByEmail = await getUser({ email: user.email });
    if (searchByAlias !== null || searchByEmail !== null)
        return true;
    return false;
};
const registerUser = async (userData) => {
    const dbResponse = await createUser(userData);
    return dbResponse;
};

const verifyEmail = async (alias, code) => {
    const user = await getUser({ alias });
    if (code === user.emailVerificationCode) {
        await updateIsEmailVerified(user);
        return true;
    }
    return false;
};
const getUserAndSendCode = async (alias) => {
    const user = await getUser({ alias: alias });
    try {
        await sendEmailVerificationCode(user);
    }
    catch (err) {
        console.log("Resend code failed:", err);
        return ({ status: INTERNAL_ERROR });
    }
    return ({ status: OK });
}
const verifyToken = (token) => {
    try {
        const res = jwt.verify(token, 'secret');
    }
    catch (err) {
        console.log(err);
        return false;
    }
    return true;
}
const changePassword = async (alias, password) => {
    const user = await getUser({ alias });
    if (user) {
        user.password = password;
        await updateOneUser({ alias }, user);
        return ({ status: OK });
    }
    else {
        console.log("Alias not found.")
        return ({ status: NOT_FOUND });
    }
}
module.exports.loginUser = loginUser;
module.exports.isUserPresent = isUserPresent;
module.exports.registerUser = registerUser;
module.exports.verifyEmail = verifyEmail;
module.exports.getUserAndSendCode = getUserAndSendCode;
module.exports.changePassword = changePassword;
module.exports.verifyToken = verifyToken;