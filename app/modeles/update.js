
updateVente = async (contract, venteId, reductionId, dateTimestamp, biereVendu, prixTotal) => {
    let res = await contract.submitTransaction("updateVente", venteId, reductionId, dateTimestamp, biereVendu, prixTotal);
    return res.length == 0 ? true : Buffer.from(res).toString();  
}
  
updateConsigne = async (contract, consigneId, biereId, count) => {
    let res = await contract.submitTransaction("updateConsigne", consigneId, biereId, count);
    //await contract.gateway.disconnect();
    return res.length == 0 ? true : Buffer.from(res).toString(); 
}
  
updateTicketDeReduction = async (contract, ticketReducId, prixReduc, codeBarre, isEnabled) => {
    let res = await contract.submitTransaction("updateTicketDeReduction", ticketReducId, prixReduc, codeBarre, isEnabled);
    return res.length == 0 ? true : Buffer.from(res).toString(); 
}

updateBiere = async (contract, biereId, name, stock, codeBarre, consigne, prix) => {
    let res = await contract.submitTransaction("updateBiere", biereId, name, stock, codeBarre, consigne, prix);
    return res.length == 0 ? true : Buffer.from(res).toString();    
}

module.exports = {
    updateVente : updateVente,
    updateConsigne : updateConsigne,
    updateTicketDeReduction : updateTicketDeReduction,
    updateBiere : updateBiere
}