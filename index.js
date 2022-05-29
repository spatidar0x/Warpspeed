const express = require('express');
const InputDataDecoder = require('ethereum-input-data-decoder');
const app = express();
const axios = require('axios');
var Web3 = require('web3');
var web3 = new Web3(new Web3.providers.HttpProvider("https://mainnet.infura.io/v3/bb342a900b8e41f6bbc125e521194467"));

app.get('/getDecodedTransaction', (req, res) => {
    txHash = req.query.txHash;
    web3.eth.getTransaction(txHash, (error, txResult) => {
        //console.log(txResult);
        if (txResult === '0x') {
                res.send({
                message: "Error",
                methodResponse: "",
                status: 'Failed'
            });
        } else {
            message = txResult.from + ' has transferred ' + txResult.value + ' amount to ' + txResult.to;
        
            //res.send(txResult);
            const smartContractAddress = txResult.to;
            url = 'https://api.etherscan.io/api?module=contract&action=getabi&address='+smartContractAddress+'&apikey=A6VYVVB4X374QB72GXJYTK82FQ65NZ2K6Y';
            console.log(url);
    
           // const UNISWAPAddress = '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984';
            // url = 'https://api.etherscan.io/api?module=contract&action=getabi&address='+UNISWAPAddress+'&apikey=A6VYVVB4X374QB72GXJYTK82FQ65NZ2K6Y';
    
            axios({
                method: 'get',
                url: url
            }).then(function (response) {
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
                res.send({
                    message: message,
                    methodResponse: methodResponse,
                    status: 'Ok'
                });
                });
        }
        
    });
});
 
//PORT ENVIRONMENT VARIABLE
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Listening on port ${port}..`));