const WebSocket = require("ws");
const RippleAPI = require("ripple-lib").RippleAPI;
let app = require('../../server/server');
let Balance = app.models.balance;
let Wallet = app.models.Wallet;
let ws = new WebSocket("wss://s.altnet.rippletest.net:51233");
let establishConnection = () => {
	ws = new WebSocket("wss://s.altnet.rippletest.net:51233");
	ws.onopen = function (event) {
		ws.send(JSON.stringify({ id: 1, command: "ledger_current" }));
	};
	ws.onclose = function (event) {
		establishConnection();
	};
};

establishConnection();
const api = new RippleAPI({
	server: "wss://s.altnet.rippletest.net:51233"
});
api.on("error", (errorCode, errorMessage) => {
	console.log(errorCode + ": " + errorMessage);
});
api.on("Connected", () => { console.log("Connected"); });

api.on("Disconnected", code => {
	api.connect();
});

api.connect().then(() => {
	api.isConnected();
}).catch(console.error);

ws.onopen = async function (event) {
	ws.send(
		JSON.stringify({
			id: 1,
			command: "subscribe",
			accounts: ['r35CkWkoLk22fr8oibnC15keP5DkqsU6Sm'],
			streams: ["ledger"]
		})
	);

	ws.onmessage = async function (event) {
		let tx = JSON.parse(event.data);
		let res = tx["engine_result"];
		if (res != undefined) {
			let txHash = tx["transaction"]["hash"];
			await getTransactionDetails(txHash);
		}
	};
	ws.onclose = function (event) {
		establishConnection();
	};
};

let getTransactionDetails = (hash) => {
	if (api.isConnected()) {
		return api.getTransaction(hash).then(async transaction => {
			let outcome = transaction.outcome.result;
			if (outcome == "tesSUCCESS") {
				let currency = transaction.specification.source.maxAmount.currency;
				if (currency == "XRP") {
					//console.log(transaction);
					let wallet = await Wallet.findOne({ where: { "XRP.destinationTag": transaction.specification.destination.tag } });
					if (wallet != null) {
						wallet = wallet.__data;
						const userId = wallet.userId;
						let balance = await Balance.findOrCreate({ where: { userId: userId } }, { userId: userId, XRP: { balance: 0 } });
						balance = balance[0].__data;
						if (balance.XRP != null) {
							balance.XRP = {
								"balance": balance.XRP.balance + Number(transaction.specification.source.maxAmount.value)
							}
						} else {
							balance.XRP = {
								"balance": Number(transaction.specification.source.maxAmount.value)
							}
						}
						Balance.update({ userId: userId }, balance, function (err, updatedBalance) {
							if (err) {
								console.log(err);
							}
						})
					}

				}
			}
		});
	} else {
		api.connect();
	}
};
