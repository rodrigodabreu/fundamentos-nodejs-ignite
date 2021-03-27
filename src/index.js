const { request } = require('express');
const express = require ('express');
const {v4 : uuidv4} = require('uuid')

const app = express();
app.use(express.json());

const serverPort = 3333;
const accounts = [];

// Middleware
// next é o responsável por dar andamento na requisição
/* 
    Formas que existe para uso do middleware
    1) Passando como segunfo parametro - Esse caso é utilizado quando queremos que o middleware seja executado apenas por
    uma rota em específico.
    Ex: app.get('/statement/:document', verifyIfExistAcoountDocument , (request, response) => {

    2) Utilizando no app.use() - Esse caso é quando queremos que todas as rotas utilizem o middleware
    ex: aap.use(verifyIfExistAcoountDocument)
*/
function verifyIfExistAcoountDocument(request, response, next){
    const {document} = request.headers;

    const account = accounts.find(account => account.document === document)

    if(!account){
        response.status(404).json({error: `This document don't have an account`})
    }

    request.account = account;
    
    return next();
}

function getBalance(statement) {
    const balance = statement.reduce((acc, operation) => {
        if (statement.operationType === 'credit') {
            return operation.amount + acc;
        } else {
            return operation.amount - acc;
        }
    }, 0)

    return balance;
}

// criando uma conta
app.post('/account', (request, response) => {
    const {document, name} = request.body;

    // Forma de buscar dados de um array e compra-los
    // const accountAlreadyExists = accounts.find( account => account.document === document)

    // Outra forma de buscar dados de um array e compra-los
    const accountAlreadyExists = accounts.some((account) => {
        return account.document === document
    })

    if(accountAlreadyExists){
        return response.status(400).json({error: 'This document is already in use for one account'})
    }

    const account = {
        id: uuidv4(),
        name: name,
        document: document,
        statement: []
    }
    console.log(account);
    accounts.push(account);
    console.log(accounts);

    return response.status(201).send();
})

// Retornar os dados da conta
app.get('/account', verifyIfExistAcoountDocument, (request, response) => {
    const { account } = request;
    return response.json(account);
})

// Buscar o extrato bancário da conta
app.get('/statement/', verifyIfExistAcoountDocument , (request, response) => {
    const {account} = request
    return response.json(account.statement)
});

//Realizando um depóstio
app.post('/deposit', verifyIfExistAcoountDocument, (request, response) => {
    const { description, amount } = request.body;

    const { account } = request;

    const statementOperation = {
        description,
        amount,
        create_at: new Date(),
        operationType: 'credit'
    }

    account.statement.push(statementOperation);

    return response.status(201).send();
})


//Realizando um saque
app.post('/withdraw', verifyIfExistAcoountDocument, (request, response) => {
    const { amount } = request.body;

    const { account } = request;

    const balance = getBalance(account.statement)
    if (balance <= amount) {
        return response.status(400).json({error: 'Insuficient funds'})
    }

    const statementOperation = {
        amount,
        create_at: new Date(),
        operationType: 'withdraw'
    }

    account.statement.push(statementOperation)

    return response.status(201).send();
})

app.listen(serverPort);
