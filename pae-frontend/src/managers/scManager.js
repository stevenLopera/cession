


// This file will contain and export the functions to connect this project with the smart contract

// Functions have to be exported in order to import them and call them in the components needed

// example

// Todo delete

import Web3Provider from 'react-web3'


export function getProvider() {
    const web3 = new Web3Provider('http://localhost:8000')
    if (web3) {
        return web3
    } else {
        return Web3Provider.ErrorTemplate
    }   
}

// now this function can be imported an called anywhere in the project
