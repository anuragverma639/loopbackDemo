'use strict';

const walletUtils = require("./../utils/walletCreation");
module.exports = function (Wallet) {

    Wallet.createWallet = async function (userId) {

        return new Promise(async (resolve, reject) => {

            const eth = await walletUtils.createEthWallet();
            const xrp = await walletUtils.createXRPWallet();

            Wallet.findOrCreate({ where: { userId: userId } }, { ETH: eth, XRP: xrp, userId: userId }, (err, res) => {
                if (err) {
                    reject(err)
                } else {
                    const data = {
                        "ETH": { address: res.ETH.address },
                        "XRP": { address: res.XRP.address, destinationTag: res.XRP.destinationTag }
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
        accepts: { arg: 'userId', type: 'string' },
        returns: {
            arg: 'data',
            type: 'object'
        }
    });
};
