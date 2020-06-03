let json = require('./config.json')
var request = require('request');


module.exports.createKeystore = async function() {

  return new Promise((resolve, reject) => {
    var headersOpt = {
      // "content-type": "application/json",
    };


    request({
        method: 'post',
        url: 'http://127.0.0.1:9650/ext/keystore',
        body: {
          "jsonrpc": "2.0",
          "id": 1,
          "method": "keystore.createUser",
          "params": {
            "username": json.username,
            "password": json.password
          }
        },
        headers: headersOpt,
        json: true,
      },
      (error, response, body) => {


        resolve(response)
      })
  })

}

module.exports.createAddressXChain = async function() {

  return new Promise((resolve, reject) => {
    var headersOpt = {
      // "content-type": "application/json",
    };


    request({
        method: 'post',
        url: 'http://127.0.0.1:9650/ext/bc/X',
        body: {
          "jsonrpc": "2.0",
          "id": 2,
          "method": "avm.createAddress",
          "params": {
            "username": json.username,
            "password": json.password
          }
        },
        headers: headersOpt,
        json: true,
      },
      (error, response, body) => {

        resolve(response)
      })
  })

}


module.exports.createAddressPChain = async function() {

  return new Promise((resolve, reject) => {
    var headersOpt = {
      // "content-type": "application/json",
    };


    request({
        method: 'post',
        url: 'http://127.0.0.1:9650/ext/P',
        body: {
          "jsonrpc": "2.0",
          "method": "platform.createAccount",
          "params": {
            "username": json.username,
            "password": json.password
          },
          "id": 1
        },
        headers: headersOpt,
        json: true,
      },
      (error, response, body) => {

        resolve(response)
      })
  })

}


module.exports.checkWalletBalanceXChain = async function(wallet) {

  return new Promise((resolve, reject) => {
    var headersOpt = {
      // "content-type": "application/json",
    };


    request({
        method: 'post',
        url: 'http://127.0.0.1:9650/ext/bc/X',
        body: {
          "jsonrpc": "2.0",
          "id": 3,
          "method": "avm.getBalance",
          "params": {
            "address": wallet,
            "assetID": "AVA"
          }
        },
        headers: headersOpt,
        json: true,
      },
      (error, response, body) => {

        resolve(response)
      })
  })

}


module.exports.sendAVAtoXChain = async function(wallet) {

  return new Promise((resolve, reject) => {
    var headersOpt = {
      // "content-type": "application/json",
    };


    request({
        method: 'post',
        url: 'http://127.0.0.1:9650/ext/bc/X',
        body: {
          "username": json.username,
          "password": json.password,
          "assetID": "AVA",
          "amount": 1000,
          "to": wallet
        },

        headers: headersOpt,
        json: true,
      },
      (error, response, body) => {

        resolve(response)
      })
  })

}

module.exports.exportAVAXChainToPChain = async function(pchain) {

  return new Promise((resolve, reject) => {
    var headersOpt = {
      // "content-type": "application/json",
    };


    request({
        method: 'post',
        url: 'http://127.0.0.1:9650/ext/bc/X',
        body: {
          "jsonrpc": "2.0",
          "id": 1,
          "method": "avm.exportAVA",
          "params": {
            "username": json.username,
            "password": json.password,
            "to": pchain,
            "amount": 10000
          }
        },

        headers: headersOpt,
        json: true,
      },
      (error, response, body) => {

        resolve(response)
      })
  })

}

module.exports.acceptTransferPChain = async function(pchain) {

  return new Promise((resolve, reject) => {
    var headersOpt = {
      // "content-type": "application/json",
    };


    request({
        method: 'post',
        url: 'http://127.0.0.1:9650/ext/bc/P',
        body: {
          "jsonrpc": "2.0",
          "method": "platform.importAVA",
          "params": {
            "username": json.username,
            "password": json.password,
            "to": pchain,
            "payerNonce": 1
          },
          "id": 1
        },

        headers: headersOpt,
        json: true,
      },
      (error, response, body) => {

        resolve(response)
      })
  })

}

module.exports.getTxStatusP = async function(pchain) {

  return new Promise((resolve, reject) => {
    var headersOpt = {
      // "content-type": "application/json",
    };


    request({
        method: 'post',
        url: 'http://127.0.0.1:9650/ext/bc/P',
        body: {
          "jsonrpc": "2.0",
          "method": "platform.importAVA",
          "params": {
            "username": json.username,
            "password": json.password,
            "to": pchain,
            "payerNonce": 1
          },
          "id": 1
        },

        headers: headersOpt,
        json: true,
      },
      (error, response, body) => {

        resolve(response)
      })
  })

}

module.exports.getAccountPChain = async function(pchain) {

  return new Promise((resolve, reject) => {
    var headersOpt = {
      // "content-type": "application/json",
    };


    request({
        method: 'post',
        url: 'http://127.0.0.1:9650/ext/bc/P',
        body: {
          "jsonrpc": "2.0",
          "method": "platform.getAccount",
          "params": {
            "address": pchain
          },
          "id": 1
        },

        headers: headersOpt,
        json: true,
      },
      (error, response, body) => {

        resolve(response)
      })
  })

}

module.exports.validation = async function(pchain) {

  return new Promise((resolve, reject) => {
    var headersOpt = {
      // "content-type": "application/json",
    };


    request({
        method: 'post',
        url: 'http://127.0.0.1:9650/ext/admin',
        body: {
          "jsonrpc": "2.0",
          "method": "admin.getNodeID",
          "params": {},
          "id": 1
        },

        headers: headersOpt,
        json: true,
      },
      (error, response, body) => {

        resolve(response)
      })
  })

}


module.exports.unsignedNodeTx = async function(node, pchain) {

  return new Promise((resolve, reject) => {
    var headersOpt = {
      // "content-type": "application/json",
    };

    console.log('UNSIGNED QUERY');
    console.log({
      "jsonrpc": "2.0",
      "method": "platform.addDefaultSubnetValidator",
      "params": {
        "id": node,
        "payerNonce": 2,
        "destination": pchain,
        "startTime": Number((new Date(new Date().getTime() + 15 * 60000).getTime() / 1000).toFixed(0)),
        "endTime": 1592265599,
        "stakeAmount": 10000
      },
      "id": 1
    })
    request({
        method: 'post',
        url: 'http://127.0.0.1:9650/ext/P',
        body: {
          "jsonrpc": "2.0",
          "method": "platform.addDefaultSubnetValidator",
          "params": {
            "id": node,
            "payerNonce": 2,
            "destination": pchain,
            "startTime": Number((new Date(new Date().getTime() + 15 * 60000).getTime() / 1000).toFixed(0)),
            "endTime": 1592265599,
            "stakeAmount": 10000
          },
          "id": 1
        },

        headers: headersOpt,
        json: true,
      },
      (error, response, body) => {

        resolve(response)
      })
  })

}




module.exports.signTxPChain = async function(tx, pchain) {

  return new Promise((resolve, reject) => {
    var headersOpt = {
      // "content-type": "application/json",
    };


    request({
        method: 'post',
        url: 'http://127.0.0.1:9650/ext/P',
        body: {
          "jsonrpc": "2.0",
          "method": "platform.sign",
          "params": {
            "tx": tx,
            "signer": pchain,
            "username": json.username,
            "password": json.password
          },
          "id": 2
        },

        headers: headersOpt,
        json: true,
      },
      (error, response, body) => {

        resolve(response)
      })
  })

}


module.exports.issueTxPChain = async function(tx) {

  return new Promise((resolve, reject) => {
    var headersOpt = {
      // "content-type": "application/json",
    };


    request({
        method: 'post',
        url: 'http://127.0.0.1:9650/ext/bc/P',
        body: {
          "jsonrpc": "2.0",
          "method": "platform.issueTx",
          "params": {
            "tx": tx
          },
          "id": 1
        },

        headers: headersOpt,
        json: true,
      },
      (error, response, body) => {

        resolve(response)
      })
  })

}
module.exports.issueTxPChainAdmin = async function(tx) {

  return new Promise((resolve, reject) => {
    var headersOpt = {
      // "content-type": "application/json",
    };


    request({
        method: 'post',
        url: 'http://127.0.0.1:9650/ext/P',
        body: {
          "jsonrpc": "2.0",
          "method": "platform.issueTx",
          "params": {
            "tx": tx
          },
          "id": 3
        },

        headers: headersOpt,
        json: true,
      },
      (error, response, body) => {

        resolve(response)
      })
  })

}
module.exports.getTxStatusX = async function(tx) {

  return new Promise((resolve, reject) => {
    var headersOpt = {
      // "content-type": "application/json",
    };


    request({
        method: 'post',
        url: 'http://127.0.0.1:9650/ext/bc/X',
        body: {
          "jsonrpc": "2.0",
          "id": 6,
          "method": "avm.getTxStatus",
          "params": {
            "txID": tx
          }
        },

        headers: headersOpt,
        json: true,
      },
      (error, response, body) => {

        resolve(response)
      })
  })

}