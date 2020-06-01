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


console.log("  ______   _______   __         ______    ______   __    __ ");
console.log(" /      \ /       \ /  |       /      \  /      \ /  |  /  |");
console.log("/$$$$$$  |$$$$$$$  |$$ |      /$$$$$$  |/$$$$$$  |$$ | /$$/ ");
console.log("$$ |__$$ |$$ |__$$ |$$ |      $$ |  $$ |$$ |  $$/ $$ |/$$/  ");
console.log("$$    $$ |$$    $$< $$ |      $$ |  $$ |$$ |      $$  $$<   ");
console.log("$$$$$$$$ |$$$$$$$  |$$ |      $$ |  $$ |$$ |   __ $$$$$  \  ");
console.log("$$ |  $$ |$$ |__$$ |$$ |_____ $$ \__$$ |$$ \__/  |$$ |$$  \ ");
console.log("$$ |  $$ |$$    $$/ $$       |$$    $$/ $$    $$/ $$ | $$  |");
console.log("$$/   $$/ $$$$$$$/  $$$$$$$$/  $$$$$$/   $$$$$$/  $$/   $$/ ");




async function start() {

  console.log('1.Stake your AVA')
  console.log('Create your KEYSTORE')

  let keyStoreResponse = await helper.createKeystore();
  console.log('Keystore is created', keyStoreResponse.body)
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
  let xWalletResponse = await helper.createAddressXChain();
  console.log('xWalletResponse', xWalletResponse.statusCode)

  if (xWalletResponse.statusCode === 404) {


    console.log("Your node is probably not synced, wallet is not created")
    console.log("we will retry in 60sec.")
    await new Promise(resolve => setTimeout(resolve, 60000));
    console.log('Trying to launch the node again')

    createWallet()

  } else {
    d.xWalletResponse = xWalletResponse.body
    console.log('Wallet is created is created on X-Chain', d.xWalletResponse.result.address)
    nodeIsLaunchedProcess()
  }




}

async function nodeIsLaunchedProcess() {
  let pWalletResponse = await helper.createAddressPChain();
  d.pWalletResponse = pWalletResponse.body

  console.log('Wallet is created is created on P-Chain', d.pWalletResponse.result.address)


  claimFaucet()
}

async function claimFaucet() {
  console.log('*******');
  console.log('Go to https://faucet.ava.network/ and claim tokens');
  console.log('Type your X-Chain wallet ', d.xWalletResponse.result.address)
  console.log('When you have successfully received your tokens, press any key to continue');

  await keypress()

  var balance = await helper.checkWalletBalanceXChain(d.xWalletResponse.result.address)
  console.log("Balance", balance.body)
  if (balance.body.result.balance > 10000) {
    console.log('Your balance has ' + balance.body.result.balance + ' nAVA');
    sendAVAtoPChain()
  } else {

    console.log('You do not have enough nAVA, claim some tokens');
    claimFaucet()

  }

}

async function sendAVAtoPChain() {
  console.log('Exporting tokens from X Chain to P Chain', d.pWalletResponse.result.address)
  var exportVal = await helper.exportAVAXChainToPChain(d.pWalletResponse.result.address)
  console.log('Accepting transfer to pchain', exportVal.body)




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
  console.log("Waiting 5 sec", d.pWalletResponse.result.address)
  await new Promise(resolve => setTimeout(resolve, 5000));
  var txStatus = await helper.getTxStatusX(exportVal.body.result.txID)
  console.log('txStatus', txStatus.body)

  if (txStatus.body.result.status === 'Processing') {
    checkStatus(exportVal);
  } else {

    console.log("Waiting 5 sec", d.pWalletResponse.result.address)
    await new Promise(resolve => setTimeout(resolve, 5000));
    var tx = await helper.acceptTransferPChain(d.pWalletResponse.result.address)

    console.log("Waiting 5 sec", d.pWalletResponse.result.address)
    await new Promise(resolve => setTimeout(resolve, 5000));
    console.log('Issuing tx to pchain : ', tx.body.result.tx)
    let issue = await helper.issueTxPChain(tx.body.result.tx)
    console.log("Issue body", issue.body)


    checkBalancePchain()

  }

}

async function checkBalancePchain() {
  console.log("Waiting 5 sec", d.pWalletResponse.result.address)
  await new Promise(resolve => setTimeout(resolve, 5000));
  let balancePChain = await helper.getAccountPChain(d.pWalletResponse.result.address)
  console.log("Balance pChain: ", balancePChain.body)

  if (Number(balancePChain.body.result.balance) === 0) {
    checkBalancePchain()
  } else {
    validation()
  }

}
async function validation() {
  let node = await helper.validation();

  d.node = node.body;
  console.log("Node", d.node)
  let unsigned = await helper.unsignedNodeTx(d.node.result.nodeID, d.pWalletResponse.result.address)
  console.log("unsigned", unsigned.body)
  let signed = await helper.signTxPChain(unsigned.body.result.unsignedTx, d.pWalletResponse.result.address)

  console.log('signed', signed.body)
  let issuePchain = await helper.issueTxPChainAdmin(signed.body.result.tx)
  console.log('issue', issuePchain.body)
  console.log("  ______   _______   __         ______    ______   __    __ ");
  console.log(" /      \ /       \ /  |       /      \  /      \ /  |  /  |");
  console.log("/$$$$$$  |$$$$$$$  |$$ |      /$$$$$$  |/$$$$$$  |$$ | /$$/ ");
  console.log("$$ |__$$ |$$ |__$$ |$$ |      $$ |  $$ |$$ |  $$/ $$ |/$$/  ");
  console.log("$$    $$ |$$    $$< $$ |      $$ |  $$ |$$ |      $$  $$<   ");
  console.log("$$$$$$$$ |$$$$$$$  |$$ |      $$ |  $$ |$$ |   __ $$$$$  \  ");
  console.log("$$ |  $$ |$$ |__$$ |$$ |_____ $$ \__$$ |$$ \__/  |$$ |$$  \ ");
  console.log("$$ |  $$ |$$    $$/ $$       |$$    $$/ $$    $$/ $$ | $$  |");
  console.log("$$/   $$/ $$$$$$$/  $$$$$$$$/  $$$$$$/   $$$$$$/  $$/   $$/ ");

  console.log("BOOOM YOUR ARE DONE. YOU SHALL BE IN THE LIST OF VALIDATORS")
  console.log("https://explorer.ava.network/validators")
}
start()