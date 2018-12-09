let Web3 = require('web3');
let web3 = new Web3();
web3 = new Web3(new Web3.providers.HttpProvider("https://kovan.infura.io/OXT57RSCW0pU6bRNWyX7"));
const rippleAPI = require("ripple-lib").RippleAPI;
const api = new rippleAPI({
	server: "wss://s.altnet.rippletest.net:51233"
})
let abiEURS = require('../../config/eurs');
let abiUSDC = require('../../config/usdc');
const from = process.env.ETHFROM;
const ethPrivateKey = process.env.ETHPRIVATEKEY;
const source = process.env.XRPFROM;
const secret = process.env.XRPPRIVATEKEY;
let app = require('../../server/server');

const sendCoin = (coin, amount, address) => {
	return new Promise((resolve, reject) => {
		if (coin == 'USDC') {
			amount = amount * (10 ** 18)
			const contractInstance = new web3.eth.Contract(abiUSDC, '0x3d97da64925f44374574bb7c3578a48ebc19c21e');
			let encodedABI = contractInstance.methods.transfer(address, amount).encodeABI();
			web3.eth.getTransactionCount(from, 'pending').then(function (count) {
				var tx = {
					from: from,
					to: '0x3d97da64925f44374574bb7c3578a48ebc19c21e',
					gas: 300000,
					data: encodedABI,
					nonce: count
				};
				web3.eth.accounts.signTransaction(tx, ethPrivateKey).then(signed => {
					var tran = web3.eth.sendSignedTransaction(signed.rawTransaction);
					tran.on('transactionHash', function (hash) {
						resolve(hash);
					});
				});
			});
		} else if (coin == 'EURS') {
			const contractInstance = new web3.eth.Contract(abiEURS, '0xb4037e11a0693bb49f68eb5928608f7fbef3c5eb');
			let encodedABI = contractInstance.methods.transfer(address, amount).encodeABI();
			web3.eth.getTransactionCount(from, 'pending').then(function (count) {
				var tx = {
					from: from,
					to: '0xb4037e11a0693bb49f68eb5928608f7fbef3c5eb',
					gas: 300000,
					data: encodedABI,
					nonce: count
				};
				web3.eth.accounts.signTransaction(tx, ethPrivateKey).then(signed => {
					var tran = web3.eth.sendSignedTransaction(signed.rawTransaction);
					tran.on('transactionHash', function (hash) {
						resolve(hash);
					});
				});
			});
		} else if (coin == 'XRP') {
			const payment = {
				"source": {
					"address": source,
					"maxAmount": {
						"value": amount,
						"currency": "XRP"
					}
				},
				"destination": {
					"address": address,
					"amount": {
						"value": amount,
						"currency": "XRP"
					}
				}
			}
			api.connect()
				.then(() => {
					return api.getAccountInfo(source)
				}).then(() => {
					return api.preparePayment(source, payment)
				}).then(prepared => {
					return api.sign(prepared.txJSON, secret)
				}).then(result => {
					hash = result.id
					// console.log("5");
					return api.submit(result.signedTransaction)
				}).then(sub => {
					//  console.log("6");
					if (sub.resultCode == 'tesSUCCESS') {
						resolve(hash);
					}
				}).catch(e => {
					reject(e)
				})
		} else if( coin == 'ETH'){
			web3.eth.getTransactionCount(from, 'pending').then(function (count) {
				var tx = {
					from: from,
					to: address,
					gas: 21000,
					nonce: count
				};
				web3.eth.accounts.signTransaction(tx, ethPrivateKey).then(signed => {
					var tran = web3.eth.sendSignedTransaction(signed.rawTransaction);
					tran.on('transactionHash', function (hash) {
						resolve(hash);
					});
				});
			});

		}
	})
}

const updateBalance = (userId, coin, amount) => {

	return new Promise(async (resolve, reject) => {
		let Balances = app.models.balance;
		let balance = await Balances.findOne({ userId: userId });
		balance = balance.__data;
		balance[coin].balance -= amount;
		Balances.update({ userId: userId }, balance, async function (err) {
			if (err) {
				reject(err)
			} else {
				resolve(true)
			}
		})
	})
}

module.exports = {
	sendCoin,
	updateBalance
}