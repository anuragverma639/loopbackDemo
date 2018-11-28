const Web3 = require('web3');
let web3 = new Web3();
web3 = new Web3(new Web3.providers.WebsocketProvider("wss://kovan.infura.io/ws"));
let app = require('../../server/server');
let Balance = app.models.balance;
let Wallet = app.models.Wallet;
let abi = require('../../config/eurs');

const contract = new web3.eth.Contract(abi, '0xb4037e11a0693bb49f68eb5928608f7fbef3c5eb');

contract.events.Transfer({}, async (error, event) => {
    if (error) {
        console.log("eurs",error);
    }
    if(event!=null){
        let wallet = await Wallet.findOne({ where: { "ETH.address": event.returnValues[1] } });
        if(wallet!=null){
            wallet = wallet.__data;
            const userId = wallet.userId;
            let balance = await Balance.findOrCreate({ where: { userId: userId } }, { userId: userId, EURS: { balance: 0 } });
            balance = balance[0].__data;
            if (balance.EURS != null) {
                balance.EURS = {
                    "balance": balance.EURS.balance + (event.returnValues[2]/(10**18))
                }
            } else {
                balance.EURS = {
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

