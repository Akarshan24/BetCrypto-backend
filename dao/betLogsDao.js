const { OK, INTERNAL_ERROR } = require("../constants");
const BetLogs = require("../models/betLogs")

module.exports.addTransactionToLogs = async (object) => {
    try {
        const response = BetLogs.create(object);
        return ({ status: OK });
    }
    catch (error) {
        console.log("Error while creating bet log:%s", error);
        return ({ status: INTERNAL_ERROR });
    }
}