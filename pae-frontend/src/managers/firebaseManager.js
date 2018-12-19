

import  {fire}  from '../config/fire';
import { auth } from 'firebase';



// This file will contain and export the functions to connect this project with firebase REALTIME DATABASE

// Functions have to be exported in order to import them and call them in the components needed

// example export declaration

export function uploadInvoice(data) {
    // dummy
}

// now this function can be imported an called anywhere in the project
 

// var setText = document.getElementById("setText");
// var setButton = document.getElementById("setButton");
// var getButton = document.getElementById("getButton");
// var getValue = document.getElementById("getValue");

// function submitClick(){
    
//     var invoiceID = setterInvoice.value;
//     var updateThis =  
//         {
//             id: "ID de factura",
//             keyR: "Key R",
//             keyK: "Key K",
//             amount: "Cantidad en euros",
//             SCadress: "Direccion SC",
//             state: "1"
//         };
        
//     // Get a reference to the database service
//     var firebaseRef = fire.database().ref();
//     firebaseRef.child("Invoices/" + invoiceID).update(updateThis);
//     //firebaseRef.child("Text").set(setText.value);
//     //window.alert("Working...")
// }

// function getOnClick(){

//     // Get a reference to the database service
//     var invoiceID = getterInvoice.value;
//     var firebaseRef = fire.database().ref();
//     firebaseRef.once("value")
//         .then(function(snapshot) {
        
//         snapshot.child("Invoices/").forEach(function(data) {
//             console.log(data.child("state").val());
//         });
        
//         var data = snapshot.child("Invoices/" + invoiceID);
//         getValue.innerText = JSON.stringify(data);
//     });
// }






// Returns fixed @ACME smart contract 
export function getAcmeSCAddress(){
    
    var firebaseRef = fire.database().ref();
    return firebaseRef.once("value")
        .then(function(snapshot) {

            console.log('promise returned');
            
                
        var data = snapshot.child("constants/ACMESCAddress");
        return data.val()
    });
}

// Generar Public Key pb_k for the bank and set
//let R = new TextDecoder("utf-8").decode(nacl.randomBytes(32));
// Returns fixed Bank Public Key 
export function getBankPublicKey(){
    var firebaseRef = fire.database().ref();
    return firebaseRef.once("value")
        .then(function(snapshot) {
                
        return snapshot.child("constants/bankPublicKey").val();
    });
}

//Funcion para buscar facturas por NºFactura
export function getInvoiceByID(id){
    var firebaseRef = fire.database().ref();
    return firebaseRef.once("value")
        .then(function(snapshot) {
        return(snapshot.child(`unsignedInvoices/${id}`).val())
       
        
    });
}


// Creates invoice using assignee form
export function createInvoice(invoice){

    let invoiceID = invoice.invoiceNumber
    
    var firebaseRef = fire.database().ref();
    var updateThis =
    {
        assigneeID: fire.auth().currentUser.uid,
        // Data es el conjunto que se le envia al Gobierno
        data: {
            RKey: invoice.RKey,
            NIF: invoice.nif,
            amount: invoice.amount,
            invoiceID: invoiceID,
            emissionDate: invoice.emissionDate,
            expirationDate: invoice.expirationDate
        },
        toDebtorAccount: invoice.toDebtorAccount,
        toCreditorAccount: invoice.toCreditorAccount,
        SCAddress: invoice.acmeSCAddress,
        KKey: invoice.KKey,
        debtorAuth: false
    };
    return firebaseRef.child("unsignedInvoices/" + invoiceID).update(updateThis).then((data) => {return data});
     
}
 
// Debtor/Bank gets invoices in function of "s"(true","false")
export function getInvoicesList(typeList){

    var toDebtorList = []
    var toCreditorList = []
    var toAssigneeList = []

    var firebaseRef = fire.database().ref();
    return firebaseRef.once("value")
        .then(function(snapshot) {
        var comission = snapshot.child("constants/ACMEComission").val();
            console.log(comission);

        // const invoiceList = snapshot.child("unsignedInvoices/").val().find((invoice) => invoice.debtorAuth === false) 
        // console.log(invoiceList);
        
        var i = 0
        var j = 0
        var l = 0
        snapshot.child("unsignedInvoices/").forEach(function(data) {
            var debtorAuth = data.child("debtorAuth").val();
            if(debtorAuth == false){
                toDebtorList[i] = data.child("data").val()
                i++
                console.log(toDebtorList)
            } else{
                toCreditorList[j] = {
                    KKey: data.child("KKey").val(),
                    SCAddress: data.child("SCAddress").val(),
                    toCreditorAccount: data.child("toCreditorAccount").val(),
                    data: (data.child("data").val())
                }
                j++
            } 
//ESTA HARDCODED PARA TESTEAR QUE FUNCIONA PILLANDO UNA UID DE UN USER
            var assigneeId = data.child("assigneeID").val();
            if(assigneeId ==  "gFdUhs3AgHSiO1hgnEybCJZb4pA3"/*fire.auth().currentUser.uid*/){
                toAssigneeList[l] = {
                    KKey: data.child("KKey").val(),
                    SCAddress: data.child("SCAddress").val(),
                    toCreditorAccount: data.child("toCreditorAccount").val(),
                    toDebtorAccount: data.child("toDebtorAccount").val(),
                    data: (data.child("data").val())
                }
                l++;
            }


        });
        
        switch(typeList) {
            case 'debtor':
                return toDebtorList
            case 'creditor':
                return toCreditorList
            case 'assignee':
                return toAssigneeList
            default:
                return null
        }
    });
}


export function getAcmeInvoicesList(){

    var toAcmeList = []

    var firebaseRef = fire.database().ref();
    return firebaseRef.once("value").then(function(snapshot) {
       
        var i = 0
        snapshot.child("acceptedInvoices/").forEach(function(data) {
            toAcmeList[i] = {
                Hash : data.child("hash").val(),
                BankPublicKey : data.child("bankPublicKey").val()
            }
            i++
            console.log(toAcmeList)
    
           

        });
        return toAcmeList;
    });
    
}

export function getFullSignedInvoicesList(){

    var list = []

    var firebaseRef = fire.database().ref();
    return firebaseRef.once("value")
        .then(function(snapshot) {

        var i = 0
        snapshot.child("signedInvoices/").forEach(function(data) {
            var assigneSign = data.child("assigneeSign").val();
            if(assigneSign != null){
                list[i] = {
                invoiceID : data.child("invoiceID").val(),
                data : data.child("data").val(),
                bankSign : data.child("bankSign").val(),
                assigneSign : data.child("assigneeSign").val()
                }
                i++
            }
        });
        return list;
    });
}

//IDEA: Borrar la JSON generada anteriormente cuando el banco publica 
//su dataset privada.
export function deleteInvoiceByInvoiceID(id, collection){
    //collection se le puede pasar signed o unsigned para decidir de donde descarga
    var firebaseRef = fire.database().ref();
    firebaseRef.child(collection + "Invoices/"+ id).remove();
}

export function getAcceptedInvoice(invoiceHash) {
    var firebaseRef = fire.database().ref();
    return firebaseRef.once('value').then(function(snapshot) {
        return snapshot.child('acceptedInvoices/' + invoiceHash).val();
    })
}

export function resolveInvoice(invoiceID){
    // Get a reference to the database service
    var firebaseRef = fire.database().ref();
    return firebaseRef.child("unsignedInvoices").child(invoiceID).update({debtorAuth: true});
}



// Creates invoice using creditor form to send to BC 
export function createAcceptedInvoice(invoice){

    var firebaseRef = fire.database().ref();
    var updateThis =
    {
        hash: invoice.hash,
        bankPublicKey: invoice.bankPublicKey
    };
        return firebaseRef.child("acceptedInvoices/" + invoice.hash).update(updateThis).then((data) => {return data});
}

/*

//IDEA: Borrar la JSON generada anteriormente cuando el banco publica 
//su dataset privada.
export function deleteInvoiceByInvoiceID(id, collection){
    //collection se le puede pasar signed o unsigned para decidir de donde descarga
    var firebaseRef = firebase.database().ref();
    firebaseRef.child(collection + "Invoices/"+ id).remove();
}

export function getAcceptedInvoice(invoiceHash) {
    var firebaseRef = firebase.database().ref();
    return firebaseRef.once('value').then(function(snapshot) {
        return snapshot.child('acceptedInvoices/' + invoiceHash).val();
    })
}

/*
// Creates new invoice collection accepted by the debtor and signed by the bank.
function createInvoiceSigned(String bankComission, String bankAccount){
    
    var invoiceID = setterInvoice.value;
    
    var firebaseRef = fire.database().ref();
    var comission = firebaseRef.once("constants/ACMEComission").val();
    var acmeAccount = firebaseRef.once("constants/ACMEAccount").val();
    var kKey = firebaseRef.once("unsignedInvoices/" + invoiceID + "/kKey").val();
    var NIF = firebaseRef.once("unsignedInvoices/" + invoiceID + "/data/NIF").val();
    var amount = firebaseRef.once("unsignedInvoices/" + invoiceID + "/data/NIF").val();
    var finalAmount = amount - acmeComission - bankComission;
    var assigneeAccount = firebaseRef.once("unsignedInvoices/" + invoiceID + "/toCreditorAccount").val();

    let data = {
        nif : NIF,
        invoiceID: invoiceID,
        amount: finalAmount,
        acmeAccount: acmeAccount,
        acmeComission: acmeComission,
        toCreditorAccount: assigneeAccount
    }
    var json = JSON.stringify(data)
    // encripta
    let encrip= aes.encryptText(data, kKey); // la k la recibio de ACME
    // firma
    let bankSign = nacl.sign(toUint8Array(""), clavesB.secretKey);
    //  envia  encrip_firmadoB a Assignee y Acme  OFF blockchain

    var updateThis =
    {   
        InvoiceID: "String",
        data : encrip,
        bankAccount: bankAccount,
        bankSign: bankSign
    };
    firebaseRef.child("signedInvoices/" + invoiceID).update(updateThis);
}

//Funcion para buscar facturas por NºFactura
function getInvoiceByInvoiceID(id, collection){
    //collection se le puede pasar signed o unsigned para decidir de donde descarga
    var firebaseRef = fire.database().ref();
    firebaseRef.once("value")
        .then(function(snapshot) {
        snapshot.child(collection + "Invoices/").forEach(function(data) {
            var invoiceID = data.val();
            if(invoiceID == id){                
                //var json = JSON.stringify(data.child("data").val())
                //console.log(json)
                console.log(data.val())
            }
        });
        
    });
}


// El assignee firma el dataset después de confirmar la info.
function acceptInvoiceSigned(){
    
    var invoiceID = setterInvoice.value;   
    var firebaseRef = fire.database().ref();
    var updateThis =
    {     
        assigneeSign: "String"
    };
    firebaseRef.child("signedInvoices/" + invoiceID).update(updateThis);
}


function getInvoiceByUserID(id, collection){
    var firebaseRef = fire.database().ref();
    firebaseRef.once("value")
        .then(function(snapshot) {
        snapshot.child(collection + "Invoices/").forEach(function(data) {
            var assigneeID = data.val();
            if(assigneeID == id){                
                //var json = JSON.stringify(data.child("data").val())
                //console.log(json)
                console.log(data.val())
            }
        });
        
    });
}
*/

// ACME gets invoices in function of full signed invoices
// export function getFullSignedInvoicesList(){

//     var list = []

//     var firebaseRef = firebase.database().ref();
//     return firebaseRef.once("value")
//         .then(function(snapshot) {

//         var i = 0
//         snapshot.child("signedInvoices/").forEach(function(data) {
//             var assigneSign = data.child("assigneeSign").val();
//             if(assigneSign != null){
//                 list[i] = {
//                 invoiceID : data.child("invoiceID").val(),
//                 data : data.child("data").val(),
//                 bankSign : data.child("bankSign").val(),
//                 assigneSign : data.child("assigneeSign").val()
//                 }
//                 i++
//             }
//         });
//         return list;
//     });
// }
