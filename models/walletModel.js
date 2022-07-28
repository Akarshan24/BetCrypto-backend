const mongoose = require("mongoose");

const WalletSchema = new mongoose.Schema({
    alias: {
        type: String,
        required: true,
    },
    bitcoin: {
        privateKey: {
            type: String,
            required: false
        },
        publicKey: {
            type: String,
            required: false
        }
    },
    ether: {
        privateKey: {
            type: String,
            required: false
        },
        publicKey: {
            type: String,
            required: false
        }

    }
});

const Wallet = mongoose.model("Wallet", WalletSchema);

module.exports = Wallet;