'use strict';

let send = require('../utils/sendCoin');

module.exports = function (Withdraw) {
  Withdraw.remoteMethod('withdrawCoin', {
    http: {
      verp: 'post',
      path: '/withdrawCoin'
    },
    accepts: [
      { arg: 'userId', type: 'string' },
      { arg: 'coin', type: 'string' },
      { arg: 'amount', type: 'string' },
      { arg: 'address', type: 'string' },
    ],
    returns: {
      arg: 'data',
      type: 'object'
    }
  });

  Withdraw.withdrawCoin = function (userId, coin, amount, address) {
    return new Promise(async (resolve, reject) => {
     // console.log("field ", userId, coin, amount, address)
      let updateBalance = await send.updateBalance(userId, coin, amount);
      if (updateBalance == true) {
        let hash = await send.sendCoin(coin, amount, address);
        if (hash != null) {
          const data = {
            userId: userId,
            coin: coin,
            amount: amount,
            address: address,
            status: true,
            txnHash: hash,
            createdAt: new Date(),
            updatedAt: new Date()
          }
          //console.log(data);
          Withdraw.create(data, (err, res) => {
            if (err) {
              reject(err)
            } else {
              resolve(res)
            }
          });
        }
      }
    });
  }
};
