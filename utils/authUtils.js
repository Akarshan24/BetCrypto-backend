const userDao = require('../dao/userDao')
const jwt = require('jsonwebtoken')
const isUserPresent = async (user) => {
    return userDao.checkForUser(user)
}
const isUserRegistrationRequestValid = (request) =>{
    if(request.alias != null && request.alias != '' && request.email != null && request.email != '' 
    && request.password != null && request.password != '' && request.paymentPasscode != null && request.paymentPasscode != '')
        return true
    return false
}
const getJWT = (alias, email)=>  jwt.sign({email: email, alias: alias}, 'secret');
module.exports.isUserPresent = isUserPresent
module.exports.isUserRegistrationRequestValid = isUserRegistrationRequestValid
module.exports.getJWT = getJWT