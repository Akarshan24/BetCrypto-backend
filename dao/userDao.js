const userModel = require('../models/userModel')
const { OK, NOT_FOUND, BAD_REQUEST, UNAUTHORIZED, FORBIDDEN, INTERNAL_ERROR } = require('../constants');
const getUser = async (query) => {
    const user = await userModel.findOne(query).lean();
    return user;
}
const findOneUser = async (query) => {
    const user = await userModel.findOne(query);
    return user;
}
const updateOneUser = async (query, update) => {
    await userModel.updateOne(query, update);
}
const createUser = async (userData) => {
    var user;
    try {
        user = await userModel.create({
            alias: userData.alias,
            email: userData.email,
            password: userData.password,
            paymentPasscode: userData.passcode,
            isEmailVerified: false,
            emailVerificationCode: null
        })
    }
    catch (err) {
        console.log("Error while registering user: ", err);
        return ({ status: INTERNAL_ERROR, message: err });
    }
    return ({ status: OK, message: user });
}
module.exports.getUser = getUser;
module.exports.findOneUser = findOneUser;
module.exports.updateOneUser = updateOneUser;
module.exports.createUser = createUser;
