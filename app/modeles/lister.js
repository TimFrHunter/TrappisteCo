

listerBiere = async (contract, startRange, endRange) => {
    let res = await contract.evaluateTransaction("listerBiere", startRange, endRange);
    return res.length == 0 ? true : JSON.parse(Buffer.from(res));  
}

listerVente = async (contract, startRange, endRange) => {
    let res = await contract.evaluateTransaction("listerVente", startRange, endRange);
    return res.length == 0 ? true : JSON.parse(Buffer.from(res));  
}

listerConsigne = async (contract, startRange, endRange) => {
    let res = await contract.evaluateTransaction("listerConsigne", startRange, endRange);
    return res.length == 0 ? true : JSON.parse(Buffer.from(res)); 
}

listerTicketReduction = async (contract, startRange, endRange) => {
    let res = await contract.evaluateTransaction("listerTicketReduction", startRange, endRange);
    return res.length == 0 ? true : JSON.parse(Buffer.from(res)); 
}

module.exports = {
    listerBiere : listerBiere,
    listerVente : listerVente,
    listerConsigne : listerConsigne,
    listerTicketReduction : listerTicketReduction
}