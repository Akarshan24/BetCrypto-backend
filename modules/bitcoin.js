var coinKey = require('coinkey');
var balance = require('crypto-balances');
const axios = require("axios");
var ci = require('coininfo')
const bitcore = require("bitcore-lib");
const { INTERNAL_ERROR, OK, IS_PROD, MAINNET_BTC, TESTNET_BTC, BTC_DOMAIN } = require('../constants');
const newBTCWallet = () => {
    var wallet = new coinKey.createRandom();
    const privateKey = wallet.privateKey.toString('hex');
    var publicKey;
    if (IS_PROD)
        publicKey = wallet.publicAddress;
    else {
        var ck = new coinKey(new Buffer(privateKey, 'hex'))
        ck.versions = ci('BTC-TEST').versions
        publicKey = ck.publicAddress;
    }
    return ({ publicKey, privateKey });
}
const getBTCBalance = async (publicKey) => {
    var sochain_network;
    if (IS_PROD)
        sochain_network = MAINNET_BTC;
    else
        sochain_network = TESTNET_BTC;
    var response = await axios.get(`${BTC_DOMAIN}/get_address_balance/${sochain_network}/${publicKey}/3`);
    response = response.data;
    if (response.status === "success") {
        return ({ status: OK, balance: response.data.confirmed_balance })
    }
    else {
        console.log("Failed to retrieve balance. Error:%s", response.data)
        return ({ status: INTERNAL_ERROR });
    }
    // const response = await balance(publicKey);
    // //console.log(response);
    // if (response[0].status === 'success')
    //     return ({ status: OK, balance: response[0].quantity });
    // else
    //     return ({ status: INTERNAL_ERROR });
}
const transferBTC = async (privateKeySource, sourceAddress, destinationAddresss, amount, satoshiPerByte) => {

    var sochain_network;
    if (IS_PROD)
        sochain_network = MAINNET_BTC;
    else
        sochain_network = TESTNET_BTC;
    const privateKey = privateKeySource;
    const satoshiToSend = amount * 100000000;
    let fee = 0;
    let inputCount = 0;
    let outputCount = 2;
    //unspent outputs
    const utxos = await axios.get(
        `${BTC_DOMAIN}/get_tx_unspent/${sochain_network}/${sourceAddress}`
    );
    const transaction = new bitcore.Transaction();
    let totalAmountAvailable = 0;

    let inputs = [];
    utxos.data.data.txs.forEach(async (element) => {
        let utxo = {};
        utxo.satoshis = Math.floor(Number(element.value) * 100000000);
        utxo.script = element.script_hex;
        utxo.address = utxos.data.data.address;
        utxo.txId = element.txid;
        utxo.outputIndex = element.output_no;
        totalAmountAvailable += utxo.satoshis;
        inputCount += 1;
        inputs.push(utxo);
    });

    transactionSize = inputCount * 146 + outputCount * 34 + 10 - inputCount;
    // Check if we have enough funds to cover the transaction and the fees assuming we want to pay 20 satoshis per byte
    //console.log(transactionSize);
    fee = transactionSize * satoshiPerByte;
    if (totalAmountAvailable - satoshiToSend - fee < 0) {
        throw new Error("Balance is too low for this transaction");
    }

    //Set transaction input
    transaction.from(inputs);

    // set the recieving address and the amount to send
    transaction.to(destinationAddresss, satoshiToSend);

    // Set change address - Address to receive the left over funds after transfer
    transaction.change(sourceAddress);

    //manually set transaction fees: 20 satoshis per byte
    transaction.fee(fee); // ~ $2

    // Sign transaction with your private key
    transaction.sign(privateKey);

    // serialize Transactions
    const serializedTransaction = transaction.serialize();
    //console.log(serializedTransaction);
    // Send transaction
    const result = await axios({
        method: "POST",
        url: `${BTC_DOMAIN}/send_tx/${sochain_network}`,
        data: {
            tx_hex: serializedTransaction,
        },
    });
    //console.log(result.data.data);
    return ({ status: OK, data: result.data.data });
}
module.exports.getBTCExchangeRate = async (currency) => {
    const result = await axios.get(`${BTC_DOMAIN}/get_price/BTC/${currency}`);
    const priceList = result.data.data.prices;
    var min = Infinity, max = 0;
    for (let index in priceList) {
        if (parseInt(priceList[index].price) < min)
            min = parseInt(priceList[index].price);
        if (parseInt(priceList[index].price) > max)
            max = parseInt(priceList[index].price);
    }
    return ({ min, max });
}
module.exports.newBTCWallet = newBTCWallet;
module.exports.getBTCBalance = getBTCBalance;
module.exports.transferBTC = transferBTC;
