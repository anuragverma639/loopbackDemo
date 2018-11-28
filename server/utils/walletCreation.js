'use strict';

let Web3 = require('web3');
let web3 = new Web3();
web3 = new Web3(new Web3.providers.HttpProvider("https://kovan.infura.io/OXT57RSCW0pU6bRNWyX7"));
const rippleAPI = require("ripple-lib").RippleAPI;
const api = new rippleAPI({
  server: "wss://s.altnet.rippletest.net:51233"
})
const CryptoJS = require("crypto-js");
const random = require("random-js")(); 
const key = process.env.KEY;
const iv = process.env.IV;

async function createEthWallet() {
  const account = web3.eth.accounts.create();
  const address = account.address;
  let privateKey = CryptoJS.AES.encrypt(account.privateKey, key, {
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
    iv: iv
  });
  privateKey = privateKey.toString();
  return { address, privateKey }
}

async function createXRPWallet() {
  const address = process.env.XRPFROM;
  const destinationTag = random.integer(10000, 999999);
  return {address, destinationTag};
}

module.exports = {
  createEthWallet,
  createXRPWallet
}