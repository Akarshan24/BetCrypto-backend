const mongoose = require("mongoose");

const BetLogsSchema = new mongoose.Schema({
    matchId: {
        type: Number,
        required: true
    },
    poolWalletKey: {
        type: String,
        requried: true
    },
    alias: {
        type: String,
        requried: true
    },
    userWalletKey: {
        type: String,
        required: true
    },
    transactionType: { // Credit / Debit
        type: String,
        required: true
    },
    transactionId: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    }

});

const BetLogs = mongoose.model("BetLogs", BetLogsSchema);

module.exports = BetLogs;