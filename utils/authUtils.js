const jwt = require('jsonwebtoken')
const isUserRegistrationRequestValid = (request) => {
    if (request.alias !== null && request.alias !== '' && request.email !== null && request.email !== ''
        && request.password !== null && request.password !== '' && request.paymentPasscode !== null && request.paymentPasscode !== '')
        return true
    return false
}
const getJWT = (alias, email, btcPublicKey) => jwt.sign({ email, alias, btcPublicKey }, 'secret');
const getRandomNumber = (min, max) => {
    const difference = max - min;
    var rand = Math.random();
    rand = Math.floor(rand * difference);
    rand = rand + min;
    return rand;
}
const generateVerificationCode = () => {
    var code = '';
    for (let i = 1; i <= 8; i++) {
        const num = getRandomNumber(65, 90);
        const character = String.fromCharCode(num);
        code = code.concat(character);
    }
    return code;
}

module.exports.isUserRegistrationRequestValid = isUserRegistrationRequestValid;
module.exports.getJWT = getJWT;
module.exports.generateVerificationCode = generateVerificationCode;

