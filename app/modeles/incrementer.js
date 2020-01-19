
incrementerVente = async (contract, venteId, reductionId, dateTimestamp, biereVendu, prixTotal) => {
    let res = await contract.submitTransaction("incrementerVente", venteId, reductionId, dateTimestamp, biereVendu, prixTotal);
    return res.length == 0 ? true : Buffer.from(res).toString();  
}
  
incrementerConsigne = async (contract, consigneId, biereId, count) => {
    let res = await contract.submitTransaction("incrementerConsigne", consigneId, biereId, count);
    //await contract.gateway.disconnect();
    return res.length == 0 ? true : Buffer.from(res).toString(); 
}
  
incrementerTicketDeReduction = async (contract, ticketReducId, prixReduc, codeBarre, isEnabled) => {
    let res = await contract.submitTransaction("incrementerTicketDeReduction", ticketReducId, prixReduc, codeBarre, isEnabled);
    return res.length == 0 ? true : Buffer.from(res).toString(); 
}

incrementerStock = async (contract, biereId, name, stock, codeBarre, consigne, prix) => {
    let res = await contract.submitTransaction("incrementerStock", biereId, name, stock, codeBarre, consigne, prix);
    return res.length == 0 ? true : Buffer.from(res).toString();    
}

module.exports = {
    incrementerVente : incrementerVente,
    incrementerConsigne : incrementerConsigne,
    incrementerTicketDeReduction : incrementerTicketDeReduction,
    incrementerStock : incrementerStock
}