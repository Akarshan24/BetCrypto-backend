const mongoose = require("mongoose");

const pendingTransactionsSchema = new mongoose.Schema({
    matchId: {
        type: Number,
        required: true
    },
    source: {
        privateKey: {
            type: String,
            required: true
        },
        publicKey: {
            type: String,
            required: true
        }
    },
    alias: {
        type: String,
        requried: true
    },
    destination: {
        type: String,
        required: true
    },
    transactionType: { // Credit / Debit
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        required: true
    }

});

const pendingTransactions = mongoose.model("pendingTransactions", pendingTransactionsSchema);

module.exports = pendingTransactions;