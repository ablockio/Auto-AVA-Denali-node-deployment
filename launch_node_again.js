let helper = require('./helper.js')
var request = require('request');
let json = require('./config.json')


let responses = {}

var d = {
  keyStoreResponse: null,
  xWalletResponse: null,
  pWalletResponse: null,
  node: null
}


console.log("  /$$$$$$  /$$    /$$  /$$$$$$                      /$$$$$$$  /$$$$$$$$ /$$   /$$  /$$$$$$  /$$       /$$$$$$");
console.log(" /$$__  $$| $$   | $$ /$$__  $$                    | $$__  $$| $$_____/| $$$ | $$ /$$__  $$| $$      |_  $$_/");
console.log("| $$  \\ $$| $$   | $$| $$  \\ $$                    | $$  \\ $$| $$      | $$$$| $$| $$  \\ $$| $$        | $$  ");
console.log("| $$$$$$$$|  $$ / $$/| $$$$$$$$       /$$$$$$      | $$  | $$| $$$$$   | $$ $$ $$| $$$$$$$$| $$        | $$  ");
console.log("| $$__  $$ \\  $$ $$/ | $$__  $$      |______/      | $$  | $$| $$__/   | $$  $$$$| $$__  $$| $$        | $$  ");
console.log("| $$  | $$  \\  $$$/  | $$  | $$                    | $$  | $$| $$      | $$\\  $$$| $$  | $$| $$        | $$  ");
console.log("| $$  | $$   \\  $/   | $$  | $$                    | $$$$$$$/| $$$$$$$$| $$ \\  $$| $$  | $$| $$$$$$$$ /$$$$$$");
console.log("|__/  |__/    \\_/    |__/  |__/                    |_______/ |________/|__script powered by https://ablock.io");




async function start() {


  validation()

}

async function validation() {
  let node = await helper.validation();

  console.log('##  Getting node ID...')

  console.log('Node Id:', json.nodeid)
  console.log('##  Creating unsigned transaction...')

  let unsigned = await helper.unsignedNodeTx(json.nodeid, json.pchain)
  console.log("unsigned", unsigned)
  console.log('##  Signing unsigned transaction...')
  let signed = await helper.signTxPChain(unsigned.body.result.unsignedTx, json.pchain)
  console.log("unsigned", signed)
  console.log('##  Issuing Transaction to P-Chain...')
  let issuePchain = await helper.issueTxPChainAdmin(signed.body.result.tx)

  console.log("unsigned", issuePchain)
  console.log("  /$$$$$$  /$$    /$$  /$$$$$$                      /$$$$$$$  /$$$$$$$$ /$$   /$$  /$$$$$$  /$$       /$$$$$$");
  console.log(" /$$__  $$| $$   | $$ /$$__  $$                    | $$__  $$| $$_____/| $$$ | $$ /$$__  $$| $$      |_  $$_/");
  console.log("| $$  \\ $$| $$   | $$| $$  \\ $$                    | $$  \\ $$| $$      | $$$$| $$| $$  \\ $$| $$        | $$  ");
  console.log("| $$$$$$$$|  $$ / $$/| $$$$$$$$       /$$$$$$      | $$  | $$| $$$$$   | $$ $$ $$| $$$$$$$$| $$        | $$  ");
  console.log("| $$__  $$ \\  $$ $$/ | $$__  $$      |______/      | $$  | $$| $$__/   | $$  $$$$| $$__  $$| $$        | $$  ");
  console.log("| $$  | $$  \\  $$$/  | $$  | $$                    | $$  | $$| $$      | $$\\  $$$| $$  | $$| $$        | $$  ");
  console.log("| $$  | $$   \\  $/   | $$  | $$                    | $$$$$$$/| $$$$$$$$| $$ \\  $$| $$  | $$| $$$$$$$$ /$$$$$$");
  console.log("|__/  |__/    \\_/    |__/  |__/                    |_______/ |________/|__script powered by https://ablock.io");

  console.log("#############################################################################################################");


  console.log("Boom! You are done. Check your validator address ")
  console.log("https://explorer.ava.network/validators")
  console.log("Recap ")
  console.log("X-Chain Wallet: " + json.xchain)
  console.log("P-Chain Wallet: " + json.pchain)
  console.log("Node ID: " + json.nodei)
}
start()