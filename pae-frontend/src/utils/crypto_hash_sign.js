
// NECESARIO PARA FRIMAS-----------------------------------------------------------------------
import * as nacl from 'tweetnacl';
//NECESARIO PARA HASH-----------------------------------------------------------------------
let keccak256 = require('js-sha3').keccak256;
//NECESARIO PARA ENCRIPTAR-----------------------------------------------------------------------
require('pidcrypt/seedrandom');
let pidcrypt = require("pidcrypt");
require("pidcrypt/aes_cbc")
let aes= new pidcrypt.AES.CBC();

//-------------ACME----------------------------------------------
// deploya en SC, pone el abi y @SC
//-------------ASSIGNEE----------------------------------------------

//genrerar k
export function generateKKey() {
  let k = new TextDecoder("utf-8").decode(nacl.randomBytes(32));
  let hash = keccak256(k);

  return hash;
}

// generar R
export function generateRKey(keyK) {
  let r = keccak256(keyK);
  return r;
}
  
// Envia off blockchain:
      //  - (invoice,R,an_u,@SC)  ---->  DEBTOR/ GENE
      //  - (invoice,k,an_u',term)  ----> ACME
//-------------DEBTOR/GENE----------------------------------------------
// deploya en SC, pone el abi y @SC
export function generateInvoiceHash(invoice){
  let infoGene = invoice.NIF + invoice.amount + invoice.invoiceID + invoice.RKey + invoice.emissionDate + invoice.expirationDate;
  let hash = keccak256(infoGene);
  return toUint8Array(hash);
}

//  sube al SC con acceptInvoice(hash)

//-------------ACME----------------------------------------------
// Envia off blockchain:
      //  - (invoice,k,an_u',comi_Ac,an_AC,@SC,term)  ----> BANK
//-------------BANK----------------------------------------------
//  let infoB = NiF + amount + num + R + emission_date + term;
//  let hash = keccak256(infoGene);
//  hash = toUint8Array(hash);

 // compueba que la factura esta aceptadas con  containsInvoice(hash) del SC de la gene // devuelve booleano
 export function generateBankKeyPairs() {
  let clavesB = nacl.sign.keyPair(); // genera sus claves
  clavesB.publicKey = clavesB.publicKey.toString();
  clavesB.secretKey = clavesB.secretKey.toString();
  return clavesB;
}
//  let clavesB= nacl.sign.keyPair(); // genera sus claves
  // envia off blockchain su clave publica (clavesB.publicKey) --->> ACME
//-------------ASSIGNEE----------------------------------------------

// let infoA= NIF + nºdefactura;
// let hash= keccak256(infoA);
// hash = toUint8Array(hash);
// sube al SC con setPublicKeyBank(hash,pk_b)

//-------------BANK----------------------------------------------
export function generateIdAndNifHash(nif, id){
  return keccak256( nif + id );
}
  // llama a  containsPublicKeyBank(hash) // le devuelve la pk_b
  // comprobar la publica son su privada
export function checksign(mensaje, publicKey){
  nacl.sign.open(mensaje,new Uint8Array(publicKey))? console.log('firma correcta'): console.log('error')
}

// let infoB= NIF + nºdefactura + amount + amount_u +an_u + comi_AC +an_AC;
// // encripta
// let encrip= aes.encryptText(infoB,k); // la k la recibio de ACME
// encrip =encrip + an_b;

// // firma
export function signMessage(txt, secretKey){
  let encrip_firmadoB = nacl.sign(toUint8Array(txt), toUint8Array(secretKey));
  let signed = toString(encrip_firmadoB)
  return signed;
}
//  envia  encrip_firmadoB a Assignee y Acme  OFF blockchain


// //-------------ASSIGNEE----------------------------------------------
// // recibe  encrip_firmadoB
// let clavesA= nacl.sign.keyPair(); // genera sus claves
// let encrip_firmadoB_firmadoA = nacl.sign(encrip_firmadoB, clavesA.secretKey);


// //-------------ACME----------------------------------------------
//   let infoAC1 = NIF + nºdefactura;
//   let infoAC2 = an_b + amount;
//   // generar R
//   let R = keccak256(k); // la k se la pasó Assignee
//   // encripta y hashea
//   let hash = keccak256(infoAC1);
//   hash = toUint8Array(hash); // El Sc lo pide en uint
//   let encryptedAmount =  aes.encryptText(infoB,R);
//    // sube al SC con setSignedAmount( hash,  signedData,  encryptedAmount)   // signedData la recibio de BANK


//    //-------------BANK----------------------------------------------
//    // llama al viewEncryptedAmount que le devuelve un  encryptedAmount  en string
//    // Desencripta
//     let des= aes.decryptText(encryptedAmount,R);
//     // paga comision a acme
//     //paga a Assignee con bankPayedUser(hash)

//   //-------------DEBTOR/GENE----------------------------------------------
//   // llama al viewEncryptedAmount que le devuelve un  encryptedAmount  en string
//   // Desencripta
//    let des= aes.decryptText(encryptedAmount,R);
// // paga a BANK con  govPayedBank(hash)


// //-------------FUNCIONES UINT - STRING------------------------------------------
// nacl pide y devuelve uint8array
// aes.encryptText y keccak256 piden y devuelven strings
function toUint8Array(s){
  //Convert a string into a Uint8Array.
  return( new TextEncoder("utf-8").encode(s));
}
function toString(u){
  // Convert an Uint8Array into a string.
  return ( new TextDecoder("utf-8").decode(u));
}
