const appPath= process.env.APP_PATH
const path = require('path')
const Contract = require(appPath +'/utils/hp/contract')

const walletPath = path.join(process.cwd(), 'wallet');
const user = 'responsable1'
const ccpPath = path.resolve(appPath + '/utils/hp/connection-orga1.json')
const channelName = 'channel-one'
const chaincodeName = 'chainecode-trappiste'

/***********************************************************************
 * ********************************************************************
 * LISTER : BIERE, VENTE, TICKETREDUCTION, CONSIGNE
 * ********************************************************************
 **********************************************************************/


listerBieres = async (startRange, endRange) => {
    contract = await Contract.getContract(walletPath, user, ccpPath, channelName, chaincodeName) //Global var
    let res = await contract.evaluateTransaction("listerBieres", startRange, endRange);
    await contract.gateway.disconnect();
    return res.length == 0 ? true : Buffer.from(res).toString();  

}

listerVente = async (startRange, endRange) => {
    contract = await Contract.getContract(walletPath, user, ccpPath, channelName, chaincodeName) //Global var
    let res = await contract.evaluateTransaction("listerVente", startRange, endRange);
    await contract.gateway.disconnect();
    return res.length == 0 ? true : Buffer.from(res).toString();  
}

listerTicketReduction = async (startRange, endRange) => {
    contract = await Contract.getContract(walletPath, user, ccpPath, channelName, chaincodeName) //Global var
    let res = await contract.evaluateTransaction("listerTicketReduction", startRange, endRange);
    await contract.gateway.disconnect();
    return res.length == 0 ? true : Buffer.from(res).toString();  
}

listerConsigne = async (startRange, endRange) => {
    contract = await Contract.getContract(walletPath, user, ccpPath, channelName, chaincodeName) //Global var
    let res = await contract.evaluateTransaction("listerConsigne", startRange, endRange);
    await contract.gateway.disconnect();
    return res.length == 0 ? true : Buffer.from(res).toString();  
}

/***********************************************************************
 * ********************************************************************
 * INCREMENTER : STOCK(BIERE), VENTE, TICKETREDUCTION, CONSIGNE
 * ********************************************************************
 **********************************************************************/

incrementerStock = async (biereId, name, stock, codeBarre, consigne, prix) => {
    contract = await Contract.getContract(walletPath, user, ccpPath, channelName, chaincodeName) //Global var
    let res = await contract.submitTransaction("incrementerStock", biereId, name, stock, codeBarre, consigne, prix);
    await contract.gateway.disconnect();
    return res.length == 0 ? true : Buffer.from(res).toString();    
}
incrementerVente = async (venteId, reductionId, dateTimestamp, biereVendu, prixTotal) => {
    contract = await Contract.getContract(walletPath, user, ccpPath, channelName, chaincodeName) //Global var
    let res = await contract.submitTransaction("incrementerVente", venteId, reductionId, dateTimestamp, biereVendu, prixTotal);
    await contract.gateway.disconnect();
    return res.length == 0 ? true : Buffer.from(res).toString();  
}
incrementerTicketDeReduction = async (ticketReducId, prixReduc, codeBarre, isEnabled) => {
    contract = await Contract.getContract(walletPath, user, ccpPath, channelName, chaincodeName) //Global var
    let res = await contract.submitTransaction("incrementerTicketDeReduction", ticketReducId, prixReduc, codeBarre, isEnabled);
    await contract.gateway.disconnect();
    return res.length == 0 ? true : Buffer.from(res).toString(); 
}
incrementerConsigne = async (consigneId, biereId, count) => {
    contract = await Contract.getContract(walletPath, user, ccpPath, channelName, chaincodeName) //Global var
    let res = await contract.submitTransaction("incrementerConsigne", consigneId, biereId, count);
    await contract.gateway.disconnect();
    return res.length == 0 ? true : Buffer.from(res).toString(); 
}
deleteByKey = async (key) => {
    contract = await Contract.getContract(walletPath, user, ccpPath, channelName, chaincodeName) //Global var
    let res = await contract.submitTransaction("delete",key);
    await contract.gateway.disconnect();
    return res.length == 0 ? true : Buffer.from(res).toString();    
}


/***********************************************************************
 * ********************************************************************
 * AUTRE
 * ********************************************************************
 **********************************************************************/
afficherBiereUnique = async (biereId) => {
    contract = await Contract.getContract(walletPath, user, ccpPath, channelName, chaincodeName) //Global var
    let res = await contract.evaluateTransaction("afficherBiereUnique", biereId);
    await contract.gateway.disconnect();
    return res.length == 0 ? true : Buffer.from(res).toString();   
}
decrementerStock = async (biereId, decrementNumber) => {
    contract = await Contract.getContract(walletPath, user, ccpPath, channelName, chaincodeName) //Global var
    let res = await contract.submitTransaction("decrementerStock", biereId, decrementNumber);
    await contract.gateway.disconnect();
    return res.length == 0 ? true : Buffer.from(res).toString(); 
}
desactiverTicketDeReduction = async (ticketReducId) => {
    contract = await Contract.getContract(walletPath, user, ccpPath, channelName, chaincodeName) //Global var
    let res = await contract.submitTransaction("desactiverTicketDeReduction", ticketReducId);
    await contract.gateway.disconnect();
    return res.length == 0 ? true : Buffer.from(res).toString(); 
}

getLastKey = async (prefixId) => {
    contract = await Contract.getContract(walletPath, user, ccpPath, channelName, chaincodeName) //Global var
    let res = await contract.evaluateTransaction("getLastKey", prefixId);
    await contract.gateway.disconnect();
    return res.length == 0 ? true : Buffer.from(res).toString();  
}

/***********************************************************************
 * ********************************************************************
 * TEST
 * ********************************************************************
 **********************************************************************/

test = async () => {
  
    console.log()
    console.log(" Do Inserts")
    console.log()
    console.log("incremente Stock Orval : ", await incrementerStock("Biere0" , "Orval", "100", "123456789", "0.18", "2.3"))
    console.log("incremente Stock Trappe :", await incrementerStock("Biere144" , "Trappe", "300", "123456790", "0.15", "1.9"))
    console.log("incremente Vente : ",await incrementerVente("Vente0" , "Reduction1", "1651351654565" ,"{\"biere1\" : 6, \"biere144\" : 12}" ,"11.95"))
    console.log("incremente Consigne: ",await incrementerConsigne("Consigne0","Biere144","30"))
    console.log("incremente Ticket de Reduction",await incrementerTicketDeReduction("TicketReduction0","0.75","164655435534","true"))
    console.log()
    console.log(" Do Queries")
    console.log()
    console.log("-------------------------------------------------------------------------------------------------------")
    console.log(JSON.parse(await listerBieres("Biere","Biere~"))) //Toutes les bieres
    console.log("-------------------------------------------------------------------------------------------------------")
    console.log(JSON.parse(await listerBieres("Biere100","Biere150"))) //Plage specifique
    console.log("-------------------------------------------------------------------------------------------------------")
    console.log(JSON.parse(await listerVente("Vente","Vente~")))
    console.log("-------------------------------------------------------------------------------------------------------")
    console.log(JSON.parse(await listerConsigne("Consigne","Consigne~")))
    console.log("-------------------------------------------------------------------------------------------------------")
    console.log(JSON.parse(await listerTicketReduction("TicketReduction","TicketReduction~")))
}

test()