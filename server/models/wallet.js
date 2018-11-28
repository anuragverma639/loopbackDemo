'use strict';

const Utils = require("./../utils/walletCreation");

module.exports = function(Wallet) {

    Wallet.createWallet = function(userId){

        return new Promise(async (resolve, reject)=>{

           const eth = await Utils.createEthWallet();
           const xrp = await Utils.createXRPWallet();
           
           Wallet.findOrCreate({where:{userId: userId}},{ETH:eth, XRP:xrp, userId: userId}, (err, res)=>{
               if(err){
                   reject(err)
                }else{
                   const data = {
                       "ETH":{ address: res.ETH.address},
                       "XRP":{ address: res.XRP.address, destinationTag: res.XRP.destinationTag }
                   }
                   resolve(data);
                }
           })
        })   
    }
   
    Wallet.remoteMethod('createWallet', {
           http: {
               verp: 'post',
               path: '/createWallet'
           },
           accepts:{ arg: 'userId', type: 'string'},
           returns: {
               arg: 'data', 
               type: 'object'
           }
    });
};
