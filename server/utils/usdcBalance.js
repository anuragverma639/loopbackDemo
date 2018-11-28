const Web3 = require('web3');
let web3 = new Web3();
web3 = new Web3(new Web3.providers.WebsocketProvider("wss://kovan.infura.io/ws"));
let app = require('../../server/server');
let Balance = app.models.balance;
let Wallet = app.models.Wallet;
let abi = require('../../config/usdc');

const contract = new web3.eth.Contract(abi, '0x3d97da64925f44374574bb7c3578a48ebc19c21e');
contract.events.Transfer({}, async (error, event) => {
    if (error) {
        console.log(error);
    }
    if(event!=null){
        let wallet = await Wallet.findOne({ where: { "ETH.address": event.returnValues[1] } });
        if(wallet!=null){
            wallet = wallet.__data;
            const userId = wallet.userId;
            let balance = await Balance.findOrCreate({ where: { userId: userId } }, { userId: userId, USDC: { balance: 0 } });
            balance = balance[0].__data;
            if (balance.USDC != null) {
                balance.USDC = {
                    "balance": balance.USDC.balance + (event.returnValues[2]/(10**18))
                }
            } else {
                balance.USDC = {
                    "balance": event.returnValues[2]/(10**18)
                }
            }
            Balance.update({ userId: userId }, balance, function (err, updatedBalance) {
                if (err) {
                    console.log(err);
                }
            })
        }
       
    }else{
        console.log("Null event");
    }
   
});

