const express = require ('express');
const uuid = require ('uuid/v4')

const app = express();
app.use(express.json());

const serverPort = 3333;
const accounts = [];

app.post('/account', (request, response) => {
    const {document, name} = request.body;

    // Forma de buscar dados de um array e compra-los
    // const accountAlreadyExists = accounts.find( account => account.document === document)

    // Outra forma de buscar dados de um array e compra-los
    const accountTest = accounts.some((account) => {
        return account.document === document
    })

    if(accountTest){
        return response.status(400).json({error: 'This document is already in use for one account'})
    }

    const account = {
        id: uuid(),
        name: name,
        document: document,
        statement: []
    }
    console.log(account);
    accounts.push(account);
    console.log(accounts);

    return response.status(201).send();
})

app.listen(serverPort);
