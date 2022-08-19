const pendingTransactions = require('../models/pendingTransactions');
module.exports.addToPendingList = async (object) => {
    try {
        const response = pendingTransactions.create(object);
        return ({ status: OK });
    }
    catch (error) {
        console.log("Error while creating bet log:%s", error);
        return ({ status: INTERNAL_ERROR });
    }
}