const express = require('express');
const InputDataDecoder = require('ethereum-input-data-decoder');
const app = express();
const axios = require('axios');
var Web3 = require('web3');
var web3 = new Web3(new Web3.providers.HttpProvider("https://mainnet.infura.io/v3/bb342a900b8e41f6bbc125e521194467"));

app.get('/getDecodedTransaction', (req, res) => {
    txHash = req.query.txHash;
    web3.eth.getTransaction(txHash, (error, txResult) => {
        if (txResult === '0x') {
            res.send({
                message: "Transaction details not found",
                methodResponse: "",
                status: 'Failed'
            });
        } else if (typeof (txResult) !== 'undefined') {

            const smartContractAddress = txResult.to;
          
            const API_KEY = 'A6VYVVB4X374QB72GXJYTK82FQ65NZ2K6Y';
            url = 'https://api.etherscan.io/api?module=contract&action=getabi&address=' + smartContractAddress + '&apikey=' + API_KEY;
            axios({
                method: 'get',
                url: url
            }).then(function (response) {
                if (response.data.result === 'Contract source code not verified') {
                    res.send({
                        message: message,
                        methodResponse: "Contract source code not verified",
                        status: 'Failed'
                    });
                }
                else {
                    contractABI = JSON.parse(response.data.result);
                    const decoder = new InputDataDecoder(contractABI);
                    const data = txResult.input.trim()
                        .replace(/(?:[\s\S]*MethodID: (.*)[\s\S])?[\s\S]?\[\d\]:(.*)/gi, '$1$2');
                    const result = decoder.decodeData(data);
                    const methodResponse = {
                        method: result.method,
                        argsTypes: result.types,
                        argNames: result.names
                    };
                    let val = web3.utils.fromWei(txResult.value, 'ether');
                    if (result.method === 'mint') {
                        message = 'Tokens worth ' + val.toString() + ' ethers have been minted to ' + txResult.to //+ ' with a gas fee of '+  gas.toString() + ' ethers';
                    } else {
                        message = txResult.from + ' has transferred ' + val.toString() + ' ethers to ' + txResult.to //+ ' with a gas fee of '+  gas.toString() + ' ethers';
                    }
                    res.send({
                        message: message,
                        methodResponse: methodResponse,
                        status: 'Ok'
                    });
                }
            });
        }

    });
});

//PORT ENVIRONMENT VARIABLE
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Listening on port ${port}..`));