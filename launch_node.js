let helper = require('./helper.js')
var request = require('request');


const keypress = async () => {
  process.stdin.setRawMode(true)
  return new Promise(resolve => process.stdin.once('data', () => {
    process.stdin.setRawMode(false)
    resolve()
  }))
}

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


  console.log('## Creating your KEYSTORE ...')

  let keyStoreResponse = await helper.createKeystore();

  d.keyStoreResponse = keyStoreResponse.body
  // Check if success OR if already created
  if ((d.keyStoreResponse.result !== undefined && d.keyStoreResponse.result.success !== undefined && d.keyStoreResponse.result.success === true) ||
    (d.keyStoreResponse.error !== undefined && d.keyStoreResponse.error.code === -32000)
  ) {
    d.keyStoreResponse = keyStoreResponse

    createWallet()

  }

}

async function createWallet() {
  console.log('## Creating your X-Chain wallet ...')

  let xWalletResponse = await helper.createAddressXChain();

  if (xWalletResponse.statusCode === 404) {


    console.log("ERROR : Your node is probably not synced, wallet is not created. ")
    console.log('The script will retry in 60 sec automaticly ...')

    await new Promise(resolve => setTimeout(resolve, 60000));
    console.log('Trying to create your wallet again ...')

    createWallet()

  } else {
    d.xWalletResponse = xWalletResponse.body
    console.log('X-Chain wallet created: ' + d.xWalletResponse.result.address)
    nodeIsLaunchedProcess()
  }




}

async function nodeIsLaunchedProcess() {
  console.log('## Creating your P-Chain wallet ...')
  let pWalletResponse = await helper.createAddressPChain();
  d.pWalletResponse = pWalletResponse.body

  console.log('X-Chain wallet created: ' + d.pWalletResponse.result.address)

  claimFaucet()
}

async function claimFaucet() {
  console.log('## Provisionning nAVA tokens ...')
  console.log('Connect to https://faucet.ava.network/ and claim tokens');
  console.log('Type your X-Chain wallet ', d.xWalletResponse.result.address)
  console.log('When you have successfully received your tokens, press any key to continue');

  // await keypress()

  var balance = await helper.checkWalletBalanceXChain(d.xWalletResponse.result.address)

  if (balance.body.result.balance > 10000) {
    console.log('Your balance has ' + balance.body.result.balance + ' nAVA');
    sendAVAtoPChain()
  } else {

    console.log('You do not have enough nAVA. Checking again in 30 sec automaticly');
    await new Promise(resolve => setTimeout(resolve, 30000));
    claimFaucet()

  }

}

async function sendAVAtoPChain() {
  console.log('## Exporting tokens from X-Chain to P-Chain', d.pWalletResponse.result.address)
  var exportVal = await helper.exportAVAXChainToPChain(d.pWalletResponse.result.address)


  checkStatus(exportVal);

  // console.log("Sending from x chain to p chain")
  // let tx = await helper.sendAVAtoXChain(d.xWalletResponse.result.address)
  //
  // let txStatus = await helper.checkTxStatus(tx.result.txID)
  //
  // console.log("TX "+d.xWalletResponse.result.address+" status ", txStatus.result.status);
  //
}
async function checkStatus(exportVal) {
  // console.log("Waiting 5 sec", d.pWalletResponse.result.address)
  // await new Promise(resolve => setTimeout(resolve, 5000));
  var txStatus = await helper.getTxStatusX(exportVal.body.result.txID)
  // console.log('txStatus', txStatus.body)

  if (txStatus.body.result.status === 'Processing') {
    console.log("Transaction is not yet confirmed, waiting 5 sec");
    await new Promise(resolve => setTimeout(resolve, 5000));
    checkStatus(exportVal);
  } else {


    var tx = await helper.acceptTransferPChain(d.pWalletResponse.result.address)

    // await new Promise(resolve => setTimeout(resolve, 5000));
    console.log('##  Issuing transation to P-Chain : ', tx.body.result.tx)
    let issue = await helper.issueTxPChain(tx.body.result.tx)

    checkBalancePchain()

  }

}

async function checkBalancePchain() {

  let balancePChain = await helper.getAccountPChain(d.pWalletResponse.result.address)


  if (Number(balancePChain.body.result.balance) === 0) {

    console.log('Balance is still 0, waiting 5 sec')
    await new Promise(resolve => setTimeout(resolve, 5000));
    checkBalancePchain()
  } else {
    console.log("Your balance on P-Chain is : ", balancePChain.body)
    validation()
  }

}
async function validation() {
  let node = await helper.validation();

  console.log('##  Getting node ID...')

  d.node = node.body;
  console.log('Node Id:', d.node.result.nodeID)
  console.log('##  Creating unsigned transaction...')

  let unsigned = await helper.unsignedNodeTx(d.node.result.nodeID, d.pWalletResponse.result.address)
  console.log('##  Signing unsigned transaction...')
  let signed = await helper.signTxPChain(unsigned.body.result.unsignedTx, d.pWalletResponse.result.address)
  console.log('##  Issuing Transaction to P-Chain...')
  let issuePchain = await helper.issueTxPChainAdmin(signed.body.result.tx)


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
  console.log("X-Chain Wallet: " + d.xWalletResponse.result.address)
  console.log("P-Chain Wallet: " + d.pWalletResponse.result.address)
  console.log("Node ID: " + d.node.result.nodeID)
}
start()