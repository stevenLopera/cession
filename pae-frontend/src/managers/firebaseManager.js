
import  firebase  from '../config/fire';
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
//     var firebaseRef = firebase.database().ref();
//     firebaseRef.child("Invoices/" + invoiceID).update(updateThis);
//     //firebaseRef.child("Text").set(setText.value);
//     //window.alert("Working...")
// }

// function getOnClick(){

//     // Get a reference to the database service
//     var invoiceID = getterInvoice.value;
//     var firebaseRef = firebase.database().ref();
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
    
    var firebaseRef = firebase.database().ref();
    return firebaseRef.once("value")
        .then(function(snapshot) {

            console.log('promise returned');
            
                
        var data = snapshot.child("constants/ACMESCAddress");
        return data.val()
    });
}


//Funcion para buscar facturas por NºFactura
export function getInvoiceByID(id){
    var firebaseRef = firebase.database().ref();
    firebaseRef.once("value")
        .then(function(snapshot) {
        snapshot.child(`unsignedInvoices/${id}`).val()
        snapshot.child("unsignedInvoices/").forEach(function(data) {
            var invoiceID = data.child("data/invoiceID").val();
            if(invoiceID == id){                
                //var json = JSON.stringify(data.child("data").val())
                //console.log(json)
                console.log(data.val())
            }
        });
        
    });
}


// Creates invoice using assignee form
export function createInvoice(invoice){

    let invoiceID = invoice.invoiceNumber
    
    var firebaseRef = firebase.database().ref();
    var updateThis =
    {
        assigneeID: firebase.auth().currentUser.uid,
        // Data es el conjunto que se le envia al Gobierno
        data: {
            RKey: "String",
            NIF: invoice.nif,
            amount: invoice.amount,
            invoiceID: invoiceID,
            emissionDate: invoice.emissionDate,
            expirationDate: invoice.expirationDate
        },
        toDebtorAccount: invoice.toDebtorAccount,
        toCreditorAccount: invoice.toCreditorAccount,
        SCAddress: invoice.acmeSCAddress,
        KKey: "String",
        debtorAuth: false
    };
    return firebaseRef.child("unsignedInvoices/" + invoiceID).update(updateThis).then((data) => {return data});
     
}
 
// Debtor/Bank gets invoices in function of "s"(true","false")
export function getInvoicesList(typeList){

    var toDebtorList = []
    var toCreditorList = []

    var firebaseRef = firebase.database().ref();
    return firebaseRef.once("value")
        .then(function(snapshot) {
        var comission = snapshot.child("constants/ACMEComission").val();
            console.log(comission);

        // const invoiceList = snapshot.child("unsignedInvoices/").val().find((invoice) => invoice.debtorAuth === false) 
        // console.log(invoiceList);
        
        var i = 0
        var j = 0
        snapshot.child("unsignedInvoices/").forEach(function(data) {
            var debtorAuth = data.child("debtorAuth").val();
            if(debtorAuth == false){
                //Falta por definir qué develvemos para montar la vista.
                //Seguramente todo el data
                 
                    //case debtor, enviar el hash del dataset a la BC sin guardarlo en FB

                var json = JSON.stringify(data.child("data").val())
                toDebtorList[i] = data.child("data").val()
                i++
                console.log(toDebtorList)
      
            } else {
                toCreditorList[j] = {
                    KKey: data.child("KKey").val(),
                    SCAddress: data.child("SCAddress").val(),
                    toCreditorAccount: data.child("toCreditorAccount").val(),
                    data: (data.child("data").val())
            }
                j++
            }


        });
        
        switch(typeList) {
            case 'debtor':
                return toDebtorList
            case 'creditor':
                return toCreditorList
            default:
                return null
        }
    });
}

export function resolveInvoice(invoiceID){
    // Get a reference to the database service
    var firebaseRef = firebase.database().ref();
    return firebaseRef.child("unsignedInvoices").child(invoiceID).update({debtorAuth: true});
}


/*

//IDEA: Borrar la JSON generada anteriormente cuando el banco publica 
//su dataset privada.
function deleteInvoiceByInvoiceID(id, collection){
    //collection se le puede pasar signed o unsigned para decidir de donde descarga
    var firebaseRef = firebase.database().ref();
    firebaseRef.child(collection + "Invoices/"+ id).remove();
}

// Creates new invoice collection accepted by the debtor and bank.
function acceptInvoiceSigned(){
    
    var invoiceID = setterInvoice.value;
    
    var firebaseRef = firebase.database().ref();
    var comission = firebaseRef.once("constants/ACMEComission").val();
    var acmeAccount = firebaseRef.once("constants/ACMEAccount").val();

    var updateThis =
    {   
        InvoiceID: "String",
        data : "String",
        /*data:{
            invoiceID: "String",  
            NIF: "String",
            amount: "Double",//Amount - comissions  
            toCreditorAccount: "String"
            comission: comission
            ACMEaccount: acmeAccount
            //Se tiene que cifraf con K toda la JSON
        },        bankAccount: "String",
        bankSign: "String"

    };
    firebaseRef.child("signedInvoices/" + invoiceID).update(updateThis);
}

//Funcion para buscar facturas por NºFactura
function getInvoiceByInvoiceID(id, collection){
    //collection se le puede pasar signed o unsigned para decidir de donde descarga
    var firebaseRef = firebase.database().ref();
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
    var firebaseRef = firebase.database().ref();
    var updateThis =
    {     
        assigneSign: "String"
    };
    firebaseRef.child("signedInvoices/" + invoiceID).update(updateThis);
}


function getInvoiceByUserID(id, collection){
    var firebaseRef = firebase.database().ref();
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