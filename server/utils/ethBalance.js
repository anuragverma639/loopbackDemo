const Web3 = require('web3');
let web3 = new Web3();
web3 = new Web3(new Web3.providers.HttpProvider("https://kovan.infura.io/OXT57RSCW0pU6bRNWyX7"));
let app = require('../../server/server');
let Balance = app.models.balance;
let Wallet = app.models.Wallet;
let startBlock = process.env.startBlock;

async function getBlock() {
	//console.log(startBlock);
	await web3.eth.getBlock(startBlock, true, async (error, block) => {
		if (block != null || block != undefined) {
			try {
				for (let txn of block.transactions) {

					let wallet = await Wallet.findOne({ where: { "ETH.address": txn.to } });
					if (wallet != null) {
						wallet = wallet.__data;
						const userId = wallet.userId;
					//	console.log(userId);
						let balance = await Balance.findOrCreate({ where: { userId: userId } }, { userId: userId, ETH: { balance: 0 } });
						balance = balance[0].__data;
						if (balance.ETH != null) {
							balance.ETH = {
								"balance": balance.ETH.balance + (txn.value / (10 ** 18))
							}
						} else {
							balance.ETH = {
								"balance": txn.value / (10 ** 18)
							}
						}
						await Balance.update({ userId: userId }, balance)
						
					}

				}
				startBlock++;
			} catch (err) {
				console.log(err);
			}
		}
	});


}

setInterval(() => {
//	console.log("anurag");
	getBlock();
	
}, 3000);
